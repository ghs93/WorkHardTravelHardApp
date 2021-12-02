import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto, MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";
const WORKING_STORAGE_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  useEffect(() => {
    loadWorkingState();
  }, []);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadToDos();
  }, []);
  const [modify, setModify] = useState("");
  const [modifyText, setModifyText] = useState("");

  const travel = async () => {
    setWorking(false);
    await saveWorkingState(false);
  };
  const work = async () => {
    setWorking(true);
    await saveWorkingState(true);
  };
  const onChangeText = (payload) => setText(payload);
  const onModifyText = (payload) => setModifyText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s !== null) {
      setToDos(JSON.parse(s));
    }
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }

    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, complete: false },
    };

    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const modifyToDo = async (key) => {
    if (modifyText === "") {
      return;
    }

    const newToDos = { ...toDos };
    newToDos[key].text = modifyText;

    setToDos(newToDos);
    await saveToDos(newToDos);
    setModifyText("");
    setModify("");
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
  };
  const updateToDo = async (key, complete) => {
    const newToDos = { ...toDos };
    newToDos[key].complete = complete;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const saveWorkingState = async (workingState) => {
    await AsyncStorage.setItem(
      WORKING_STORAGE_KEY,
      JSON.stringify(workingState)
    );
  };
  const loadWorkingState = async () => {
    const w = await AsyncStorage.getItem(WORKING_STORAGE_KEY);
    if (w) {
      setWorking(JSON.parse(w));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        autoCorrect={false}
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            key === modify ? (
              <View key={key} style={styles.toDo}>
                <TextInput
                  style={{ ...styles.modifyInput, flex: 7 }}
                  value={modifyText}
                  autoCorrect={false}
                  onSubmitEditing={() => modifyToDo(key)}
                  onChangeText={onModifyText}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={{ ...styles.opacity, flex: 1, marginStart: 35 }}
                  onPress={() => modifyToDo(key)}
                >
                  <Fontisto name="save" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.opacity, flex: 1 }}
                  onPress={() => {
                    setModifyText("");
                    setModify("");
                  }}
                >
                  <Fontisto name="close" size={18} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View key={key} style={styles.toDo}>
                <Text
                  style={{
                    ...styles.toDoText,
                    textDecorationLine: toDos[key].complete
                      ? "line-through"
                      : "none",
                  }}
                >
                  {toDos[key].text}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity style={styles.opacity}>
                    <MaterialCommunityIcons
                      name="pencil-circle-outline"
                      size={22}
                      color="white"
                      onPress={() => {
                        setModify(key);
                        setModifyText(toDos[key].text);
                      }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.opacity}
                    onPress={() => updateToDo(key, !toDos[key].complete)}
                  >
                    {toDos[key].complete ? (
                      <Fontisto
                        name="checkbox-active"
                        size={18}
                        color="white"
                      />
                    ) : (
                      <Fontisto
                        name="checkbox-passive"
                        size={18}
                        color="white"
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteToDo(key)}
                    style={styles.opacity}
                  >
                    <Fontisto name="trash" size={18} color={theme.grey} />
                  </TouchableOpacity>
                </View>
              </View>
            )
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  opacity: {
    marginHorizontal: 5,
  },
  modifyInput: {
    backgroundColor: "white",
    fontSize: 18,
  },
});
