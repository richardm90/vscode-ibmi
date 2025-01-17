import { CustomUI } from "./webviews/CustomUI";
import Instance from "./Instance";
import { Tools } from "./api/Tools";
import { DeployTools } from "./filesystems/local/deployTools";
import { ComponentRegistry } from './api/components/manager';
import { ObjectFilters } from './api/configuration/config/ConnectionManager';
import { DeploymentMethod, FileError, IBMiMember, IBMiObject, WithPath } from "./api/types";
import { Ignore } from "ignore";
import { WorkspaceFolder } from "vscode";
import { VscodeTools } from "./ui/tools";

export interface CodeForIBMi {
  instance: Instance,
  customUI: () => CustomUI,
  deployTools: typeof DeployTools,
  evfeventParser: (lines: string[]) => Map<string, FileError[]>,
  tools: typeof Tools,
  vscodeTools: typeof VscodeTools,
  componentRegistry: ComponentRegistry
}


export interface FilteredItem {
  filter: ObjectFilters
}

export interface ObjectItem extends FilteredItem, WithPath {
  object: IBMiObject
}

export interface MemberItem extends FilteredItem, WithPath {
  member: IBMiMember
}

export interface DeploymentParameters {
  method: DeploymentMethod
  workspaceFolder: WorkspaceFolder
  remotePath: string
  ignoreRules?: Ignore
}

export * from "./api/types";
export * from "./ui/types";
export * from "./filesystems/local/types";