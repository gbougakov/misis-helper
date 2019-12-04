import fetch from "node-fetch";
import * as vscode from "vscode";
import getToken from "../utils/getToken";

class OpenStatementCommand {
  context: vscode.ExtensionContext;
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.run = this.run.bind(this);
  }

  async run() {
    if (!this.context.globalState.get("login") || !this.context.globalState.get("password")) {
      const action = await vscode.window.showErrorMessage("Вы не вошли", "Войти");
      if (!action) {
        return;
      }

      vscode.commands.executeCommand("dev.gbougakov.misis.login");

      return;
    }
    const token = await getToken(this.context.globalState.get("login") as string, this.context.globalState.get("password") as string);

    const {contests} = await fetch(
      "https://contest.misis.ru/api/contest/all?count=10&offset=0&category=all&sort=byStart&sort_order=desc&query=",
      {
        headers: {
          Cookie:
            "auth.token=" + token,
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0"
        },
        method: "GET"
      }
    ).then(res => res.json());
    
    const selectedContestName = await vscode.window.showQuickPick(contests.map((o: { name: any; }) => o.name), {
      placeHolder: "Выберите контест"
    });
    
    if (!selectedContestName) {
      return;
    }
    
    const selectedContest = contests.find((o: { name: string; }) => o.name === selectedContestName);
  
    const problems = await fetch(`https://contest.misis.ru/api/contest/${selectedContest.id}/problems`, {
      headers: {
        Cookie:
          "auth.token=" + token,
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0"
      },
      method: "GET"
    }).then(res => res.json());
  
    const selectedProblem = await vscode.window.showQuickPick(problems.map((o: { title: string; }) => o.title), {
      placeHolder: "Выберите задачу"
    });
    
    if (!selectedProblem) {
      return;
    }
  
    const problem = problems.find((o: { title: string; }) => o.title === selectedProblem);
  
    const panel = vscode.window.createWebviewPanel(
      "catCoding", // Identifies the type of the webview. Used internally
      problem.title, // Title of the panel displayed to the user
      vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
      {} // Webview options. More on these later.
    );
    
    panel.webview.html = `<style>
    table, th, td {
      border: 1px solid black;
    }
    </style>` + problem.htmlStatement;
  }
}

export default OpenStatementCommand;