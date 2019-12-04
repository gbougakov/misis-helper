// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import fetch from "node-fetch";
import OpenStatementCommand from "./commands/openProblemStatement";
import LoginCommand from "./commands/login";
import SubmitCommand from "./commands/submitSolution";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("Congratulations, your extension \"misis-helper\" is now active!");

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const openStatementCmd = new OpenStatementCommand(context);

  let disposable = vscode.commands.registerCommand(
    "dev.gbougakov.misis.openProblemStatement",
    openStatementCmd.run
  );

	context.subscriptions.push(disposable);

	const loginCmd = new LoginCommand(context);
	
	let disposable2 = vscode.commands.registerCommand(
    "dev.gbougakov.misis.login",
    loginCmd.run
  );

	context.subscriptions.push(disposable2);

	const submitCmd = new SubmitCommand(context);
	
	let disposable3 = vscode.commands.registerCommand(
    "dev.gbougakov.misis.sendSolution",
    submitCmd.run
  );

  context.subscriptions.push(disposable3);
}

// this method is called when your extension is deactivated
export function deactivate() {}
