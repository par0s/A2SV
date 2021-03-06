import React from "react";
import {
  Input,
  TopNavigation,
  TopNavigationAction,
  Icon,
  Spinner,
  Button,
  Divider,
  StyleService,
  Layout,
  Modal,
  Card,
  Text,
} from "@ui-kitten/components";
import { SafeAreaView, View, TouchableWithoutFeedback } from "react-native";
import { KeyboardAvoidingView } from "../../components/3rd-party";
import userIDStore from "../../data-management/user-id-data/userIDStore";
import { strings } from "../../localization/localization";
import { LangContext } from "../../../assets/lang/language-context";

const ArrowIosBackIcon = (style) => <Icon {...style} name="arrow-ios-back" />;

const ChangePassScreen = (props) => {
  const [currPassword, setCurrPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [conNewPassword, setConNewPassword] = React.useState("");

  const [currPasswordVisible, setCurrPasswordVisible] = React.useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = React.useState(false);

  const [currPasswordStatus, setCurrPasswordStatus] = React.useState("");
  const [newPasswordStatus, setNewPasswordStatus] = React.useState("");
  const [conNewPasswordStatus, setConNewPasswordStatus] = React.useState("");

  const [currPasswordCap, setCurrPasswordCap] = React.useState("");
  const [newPasswordCap, setNewPasswordCap] = React.useState("");
  const [conNewPasswordCap, setConNewPasswordCap] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [modalState, setModalState] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState("");
  const [modalStatus, setModalStatus] = React.useState("");
  //setting up the language
  const langContext = React.useContext(LangContext);
  const lang = langContext.lang;
  strings.setLanguage(lang);

  const renderBackAction = () => (
    <TopNavigationAction
      icon={ArrowIosBackIcon}
      onPress={props.navigation.goBack}
    />
  );

  const onCurrPasswordChange = (pass) => {
    if (pass === "") {
      setCurrPasswordStatus("danger");
      setCurrPasswordCap(strings.Required);
    } else {
      setCurrPasswordStatus("basic");
      setCurrPasswordCap();
    }
    setCurrPassword(pass);
  };

  const onNewPasswordChange = (pass) => {
    if (pass === "") {
      setNewPasswordStatus("danger");
      setNewPasswordCap(strings.Required);
    } else {
      setNewPasswordStatus("basic");
      setNewPasswordCap();
    }

    setNewPassword(pass);
  };

  const onConNewPasswordChange = (pass) => {
    if (pass !== newPassword) {
      setConNewPasswordStatus("danger");
      setConNewPasswordCap(strings.PasswordDoNotMatch);
    } else {
      setConNewPasswordStatus("basic");
      setConNewPasswordCap();
    }
    setConNewPassword(pass);
  };

  const renderPassIcon = (props) => (
    <TouchableWithoutFeedback
      onPress={() => setCurrPasswordVisible(!currPasswordVisible)}
    >
      <Icon {...props} name={currPasswordVisible ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );

  const renderNewPassIcon = (props) => (
    <TouchableWithoutFeedback
      onPress={() => setNewPasswordVisible(!newPasswordVisible)}
    >
      <Icon {...props} name={newPasswordVisible ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );
  //current password check
  const changePassword = () => {
    onCurrPasswordChange(currPassword);
    onNewPasswordChange(newPassword);
    onConNewPasswordChange(conNewPassword);
    if (
      currPassword !== "" &&
      newPassword !== "" &&
      conNewPassword === newPassword
    ) {
      setIsLoading(true);
      fetch("https://sym-track.herokuapp.com/api/auth/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userIDStore.getState().userName,
          password: currPassword,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          //Updating password
          updatePassword();
        })
        .catch((error) => {
          setModalMessage(strings.WrongCurrentPassword);
          setModalState(true);
          setModalStatus("danger");
          setIsLoading(false);
        });
    }
  };
  //change passowrd
  const updatePassword = () => {
    fetch("https://sym-track.herokuapp.com/api/users", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + userIDStore.getState().userToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id: userIDStore.getState().userId,
        username: userIDStore.getState().userName,
        password: newPassword,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        setModalMessage(strings.YouHaveSuccessfullyChangedYourPassword);
        setModalState(true);
        setIsLoading(false);
        setModalStatus("success");
      })
      .catch((error) => {
        setModalMessage(strings.CantConnectDueToConnection);
        setModalState(true);
        setModalStatus("danger");
        setIsLoading(false);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Modal
        visible={modalState}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setModalState(false)}
      >
        <Card disabled={true} style={{ marginLeft: 10, marginRight: 10 }}>
          <Text status={modalStatus} category="h6" style={{ marginBottom: 10 }}>
            {modalMessage}
          </Text>
          <Text
            style={{ alignSelf: "flex-end", color: "#0080ff" }}
            onPress={() => {
              setModalState(false);
            }}
          >
            {strings.Dismiss}
          </Text>
        </Card>
      </Modal>
      <TopNavigation
        alignment="center"
        title={strings.ChangePassword}
        accessoryLeft={renderBackAction}
      />
      <Divider />
      <Layout style={{ flex: 1 }}>
        <KeyboardAvoidingView>
          <View style={styles.formContainer}>
            <Input
              style={styles.formInput}
              label={strings.CurrentPassword}
              placeholder={strings.Password}
              caption={currPasswordCap}
              status={currPasswordStatus}
              secureTextEntry={!currPasswordVisible}
              value={currPassword}
              accessoryRight={renderPassIcon}
              onChangeText={(pass) => onCurrPasswordChange(pass)}
            />
            <Input
              style={styles.formInput}
              label={strings.NewPassword}
              placeholder={strings.Password}
              caption={newPasswordCap}
              status={newPasswordStatus}
              secureTextEntry={!newPasswordVisible}
              value={newPassword}
              accessoryRight={renderNewPassIcon}
              onChangeText={(pass) => onNewPasswordChange(pass)}
            />
            <Input
              style={styles.formInput}
              caption={conNewPasswordCap}
              placeholder={strings.ConfirmNewPassword}
              label={strings.ConfirmNewPassword}
              status={conNewPasswordStatus}
              value={conNewPassword}
              secureTextEntry={true}
              onChangeText={(pass) => onConNewPasswordChange(pass)}
            />
          </View>
          <Button
            style={styles.doneButton}
            size="large"
            disabled={isLoading}
            accessoryLeft={() => (isLoading ? <Spinner /> : <></>)}
            onPress={() => {
              changePassword();
            }}
          >
            {strings.Done}
          </Button>
        </KeyboardAvoidingView>
      </Layout>
    </SafeAreaView>
  );
};

export default ChangePassScreen;

const styles = StyleService.create({
  formContainer: {
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  doneButton: {
    marginVertical: 24,
    marginHorizontal: 16,
  },
  divider: {
    flex: 1,
  },
  formInput: {
    marginTop: 16,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  indicator: {
    justifyContent: "center",
    alignItems: "center",
  },
});
