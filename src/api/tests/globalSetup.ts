import assert from "assert";
import IBMi from "../IBMi";
import { ENV_CREDS } from "./env";
import { getConnection, setConnection } from "./state";
import { afterAll, beforeAll, expect } from "vitest";
import { CodeForIStorage } from "../configuration/storage/CodeForIStorage";
import { VirtualConfig } from "../configuration/config/VirtualConfig";
import { VirtualStorage } from "../configuration/storage/BaseStorage";
import { CustomQSh } from "../components/cqsh";
import path from "path";
import { CopyToImport } from "../components/copyToImport";
import { GetMemberInfo } from "../components/getMemberInfo";
import { GetNewLibl } from "../components/getNewLibl";
import { extensionComponentRegistry } from "../components/manager";
import { JsonConfig, JsonStorage } from "./testConfigSetup";

const testConfig = new JsonConfig();
const testStorage = new JsonStorage();

export async function newConnection() {
  const virtualStorage = testStorage;

  IBMi.GlobalStorage = new CodeForIStorage(virtualStorage);
  IBMi.connectionManager.configMethod = testConfig;

  await testStorage.load();
  await testConfig.load();

  const conn = new IBMi();

  const customQsh = new CustomQSh();
  const cqshPath = path.join(__dirname, `..`, `components`, `cqsh`, `cqsh`);
  customQsh.setLocalAssetPath(cqshPath);

  const testingId = `testing`;
  extensionComponentRegistry.registerComponent(testingId, customQsh);
  extensionComponentRegistry.registerComponent(testingId, new GetNewLibl());
  extensionComponentRegistry.registerComponent(testingId, new GetMemberInfo());
  extensionComponentRegistry.registerComponent(testingId, new CopyToImport());

  const creds = {
    host: ENV_CREDS.host!,
    name: `testsystem`,
    username: ENV_CREDS.user!,
    password: ENV_CREDS.password!,
    port: ENV_CREDS.port
  };

  // Override this so not to spam the console.
  conn.appendOutput = (data) => {};

  const result = await conn.connect(
    creds,
    {
      message: (type: string, message: string) => {
        // console.log(`${type.padEnd(10)} ${message}`);
      },
      progress: ({message}) => {
        // console.log(`PROGRESS: ${message}`);
      },
      uiErrorHandler: async (connection, code, data) => {
        console.log(`Connection warning: ${code}: ${JSON.stringify(data)}`);
        return false;
      },
    }
  );

  expect(result).toBeDefined();
  expect(result.success).toBeTruthy();

  return conn;
}

beforeAll(async () => {
  const virtualStorage = testStorage;

  IBMi.GlobalStorage = new CodeForIStorage(virtualStorage);
  IBMi.connectionManager.configMethod = testConfig;

  await testStorage.load();
  await testConfig.load();

  const conn = await newConnection();

  setConnection(conn);
}, 10000000);

afterAll(async () => {
  const conn = getConnection();

  if (conn) {
    await conn.dispose();
    await testStorage.save();
    await testConfig.save();
  } else {
    assert.fail(`Connection was not set`);
  }
})