import { s } from "./Header.style";
import { Text, Image } from "react-native";
import logoImg from "../../assets/logo.png";

export function Header() {
  return (
    <>
      <Image
        style={s.img}
        source={require("../../assets/logo.png")}
        resizeMode="contain"
      />
      <Text style={s.subtile}>You probably have something to do</Text>
    </>
  );
}
