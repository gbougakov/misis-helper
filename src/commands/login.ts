import * as vscode from "vscode";
import fetch from "node-fetch";
import getToken from "../utils/getToken";

class LoginCommand {
  context: vscode.ExtensionContext;
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.run = this.run.bind(this);
  }
  async run() {
    const login = await vscode.window.showInputBox({
      placeHolder: "Логин"
    });
    const password = await vscode.window.showInputBox({
      placeHolder: "Пароль",
      password: true
    });
    
    try {
      const token = await getToken(login || "nooneisstupidenoughtousethisasausername", password || "***");

      const {fullName} = await fetch("https://contest.misis.ru/api/user/me", {
        "headers": {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0",
          "Cookie": `auth.token=${token}`
        }
      }).then(res => res.json());
      vscode.window.showInformationMessage(`Вы вошли как ${fullName}`);
      this.context.globalState.update("login", login);
      this.context.globalState.update("password", password);
    } catch(error) {
      vscode.window.showErrorMessage("Неправильный логин/пароль");
    }
    
  }
}

export default LoginCommand;