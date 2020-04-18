import * as fs from 'fs';
import * as path from 'path';
import { Uri, WorkspaceFolder } from 'vscode';

// searches up the folder structure until it finds a Cargo.toml
export function nearestParentWorkspace(
  curWorkspace: WorkspaceFolder,
  filePath: string,
): WorkspaceFolder {
  // check that the workspace folder already contains the "Cargo.toml"
  const workspaceRoot = curWorkspace.uri.fsPath;
  const rootManifest = path.join(workspaceRoot, 'Cargo.toml');
  if (fs.existsSync(rootManifest)) {
    return curWorkspace;
  }

  // algorithm that will strip one folder at a time and check if that folder contains "Cargo.toml"
  let current = filePath;
  while (true) {
    const old = current;
    current = path.dirname(current);

    // break in case there is a bug that could result in a busy loop
    if (old === current) {
      break;
    }

    // break in case the strip folder reached the workspace root
    if (workspaceRoot === current) {
      break;
    }

    // check if "Cargo.toml" is present in the parent folder
    const cargoPath = path.join(current, 'Cargo.toml');
    if (fs.existsSync(cargoPath)) {
      // ghetto change the uri on Workspace folder to make vscode think it's located elsewhere
      return {
        ...curWorkspace,
        name: path.basename(current),
        uri: Uri.file(current),
      };
    }
  }

  return curWorkspace;
}