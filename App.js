import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { s } from "./App.style";
import { Header } from "./components/Header/Header";
import { CardTodo } from "./components/CardTodo/CardTodo";
import { TabBottomMenu } from "./components/TabBottomMenu/TabBottomMenu";
import { ButtonAdd } from "./components/ButtonAdd/ButtonAdd";
import { useEffect, useState } from "react";
let isFirstRendered = true;
let isLoadUpdate = false;
import Dialog from "react-native-dialog";
import uuid from 'react-native-uuid';
import AsyncStorage from "@react-native-async-storage/async-storage";




export default function App() {
  const [todoList, setTodoList] = useState([]);
  const [selectedTabName, setSelectedTabName] = useState("all");
  const [isAddDialogDisplayed, setIsAddDialogDisplayed] = useState(false)
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    loadTodoList();
  }, [])

  useEffect(() => {
    if (!isLoadUpdate) {
      if (!isFirstRendered) {
        saveTodoList()
      } else {
        isFirstRendered = false
      }
    } else {
      isLoadUpdate = false;
    }

  }, [todoList])





  async function loadTodoList() {
    console.log('LOAD')
    try {
      const todoListString = await AsyncStorage.getItem("@todolist")
      const parsedTodoLIst = JSON.parse(todoListString)
      isLoadUpdate = true
      setTodoList(parsedTodoLIst || []);
    } catch (e) {
      alert(e);
    }
  }
  async function saveTodoList() {
    console.log('SAVE')
    try {
      await AsyncStorage.setItem("@todolist", JSON.stringify(todoList))
    } catch (e) {
      alert(e);
    }
  }


  function getFilteredList() {
    switch (selectedTabName) {
      case "all":
        return todoList
      case "inProgress":
        return todoList.filter((todo) => !todo.isCompleted)
      case "done":
        return todoList.filter((todo) => todo.isCompleted)

    }
  }
  function deleteTodo(todoToDelete) {
    Alert.alert("Delete todo", "Are you sure you want to delete this todo ?",
      [
        {
          text: "Delete", style: "destructive", onPress: () => {
            setTodoList(todoList.filter(t => t.id !== todoToDelete.id));
          }
        },
        { text: "Cancel", style: 'cancel' },
      ]
    )
  }


  function renderTodoList() {
    return getFilteredList().map((todo) => <View key={todo.id} style={s.cardItem}>
      <CardTodo onLongPress={() => deleteTodo(todo)} onPress={() => updateTodo(todo)} todo={todo} />
    </View>)
  }
  function updateTodo(todo) {
    const updatedTodo = {
      ...todo,
      isCompleted: !todo.isCompleted
    }
    const updatedTodoList = [...todoList]
    const indexToUpdate = updatedTodoList.findIndex((t) => t.id === updatedTodo.id);
    updatedTodoList[indexToUpdate] = updatedTodo;
    setTodoList(updatedTodoList)
  }



  function addTodo() {
    const newTodo = {
      id: uuid.v4(),
      title: inputValue,
      isCompleted: false
    }
    setTodoList([...todoList, newTodo]),
      setIsAddDialogDisplayed(false),
      setInputValue("")
  }
  function renderAddDialog() {
    return (
      <Dialog.Container visible={isAddDialogDisplayed} onBackdropPress={() => setIsAddDialogDisplayed(false)}>
        <Dialog.Title>Add todo</Dialog.Title>
        <Dialog.Description>
          Choose a name for your todo
        </Dialog.Description>
        <Dialog.Input onChangeText={(text) => setInputValue(text)} placeholder="Ex: Go to the dentist" />
        <Dialog.Button label="Cancel" color={'grey'} onPress={() => setIsAddDialogDisplayed(false)} />
        <Dialog.Button disabled={inputValue.length === 0} label="Save" onPress={addTodo} />
      </Dialog.Container>
    );
  }
  return (
    <>
      <SafeAreaProvider>
        <SafeAreaView style={s.app}>
          <View style={s.header}>
            <Header />
          </View>
          <View style={s.body}>
            <ScrollView>
              {renderTodoList()}
            </ScrollView>
          </View>
          <ButtonAdd onPress={() => setIsAddDialogDisplayed(true)} />
        </SafeAreaView>
      </SafeAreaProvider>
      <View style={s.footer}>
        <TabBottomMenu todoList={todoList} onPress={setSelectedTabName} selectedTabName={selectedTabName} />
      </View>
      {renderAddDialog()}
    </>
  );
}