import * as vscode from "vscode";
import fetch from "node-fetch";
import getToken from "../utils/getToken";

class SubmitCommand {
  context: vscode.ExtensionContext;
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.run = this.run.bind(this);
  }
  async run() {
    if (
      !this.context.globalState.get("login") ||
      !this.context.globalState.get("password")
    ) {
      const action = await vscode.window.showErrorMessage(
        "Вы не вошли",
        "Войти"
      );
      if (!action) {
        return;
      }

      vscode.commands.executeCommand("dev.gbougakov.misis.login");

      return;
    }
    const token = await getToken(
      this.context.globalState.get("login") as string,
      this.context.globalState.get("password") as string
    );

    if (!vscode.window.activeTextEditor) {
      vscode.window.showErrorMessage("У вас не открыт файл");
      return;
    }

    const text = vscode.window.activeTextEditor!.document.getText();

    const { contests } = await fetch(
      "https://contest.misis.ru/api/contest/all?count=10&offset=0&category=all&sort=byStart&sort_order=desc&query=",
      {
        headers: {
          Cookie: "auth.token=" + token,
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0"
        },
        method: "GET"
      }
    ).then(res => res.json());

    const selectedContestName = await vscode.window.showQuickPick(
      contests.map((o: { name: any }) => o.name),
      {
        placeHolder: "Выберите контест"
      }
    );

    if (!selectedContestName) {
      return;
    }

    const selectedContest = contests.find(
      (o: { name: string }) => o.name === selectedContestName
    );

    if (selectedContest.status === "WAITING" || selectedContest.status === "FINISHED") {
      return vscode.window.showErrorMessage("Контест еще не начат, или уже завершен");
    }

    const problems = await fetch(
      `https://contest.misis.ru/api/contest/${selectedContest.id}/problems`,
      {
        headers: {
          Cookie: "auth.token=" + token,
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0"
        },
        method: "GET"
      }
    ).then(res => res.json());

    const selectedProblem = await vscode.window.showQuickPick(
      problems.map((o: { title: string }) => o.title),
      {
        placeHolder: "Выберите задачу"
      }
    );

    if (!selectedProblem) {
      return;
    }

    const problem = problems.find(
      (o: { title: string }) => o.title === selectedProblem
    );

    const languages = await fetch(
      `https://contest.misis.ru/api/contest/${selectedContest.id}/problems/${problem.internalSymbolIndex}/languages`,
      {
        headers: {
          Cookie: "auth.token=" + token,
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0"
        },
        method: "GET"
      }
    ).then(res => res.json());

    const selectedLanguage = await vscode.window.showQuickPick(
      languages.map((o: { name: string }) => o.name),
      {
        placeHolder: "Выберите язык"
      }
    );

    if (!selectedLanguage) {
      return;
    }

    const language = languages.find(
      (o: { name: string }) => o.name === selectedLanguage
    );

    const solution = await fetch(
      `https://contest.misis.ru/api/contest/${selectedContest.id}/solutions`,
      {
        headers: {
          Cookie: "auth.token=" + token,
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contestId: selectedContest.id,
          languageId: language.id,
          solution: text,
          symbolIndex: problem.internalSymbolIndex
        }),
        method: "POST"
      }
    ).then(res => res.json());
    let lastAnswer = undefined;
    let count = 0;
    while(!lastAnswer || (lastAnswer as {verdict: {name: string}}).verdict === null) {
      if (count > 500) {
        vscode.window.showErrorMessage("Вашему решению не был вынесен вердикт. Скорее всего, упал МИСиС ACM");
        return;
      }
      const result = await fetch(
        `https://contest.misis.ru/api/contest/${selectedContest.id}/solutions/${solution.id}/code`,
        {
          headers: {
            Cookie: "auth.token=" + token,
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0"
          },
          method: "GET"
        }
      ).then(res => res.json());
      console.log(result);
      lastAnswer = result;
      count++;
    }
    if (lastAnswer.verdict.id === 1) {
      vscode.window.showInformationMessage("🎉 Решение прошло проверку");
    } else {
      vscode.window.showInformationMessage("😞 Решение не прошло проверку. Вердикт: " + lastAnswer.verdict.name);
    }
  }
}

export default SubmitCommand;
