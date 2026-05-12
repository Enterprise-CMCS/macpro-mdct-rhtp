// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import path, { dirname } from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDirPath = path.resolve(
  path.join(__dirname, "../../services/ui-src/public/")
);
const configFilePath = path.resolve(path.join(publicDirPath, "env-config.js"));

export const writeLocalUiEnvFile = async (
  envVariables: Record<string, string>
) => {
  await fs.rm(configFilePath, { force: true });

  const unescapeDoubleQuotes = (value: string) => {
    return value.replaceAll(String.raw`\"`, '"');
  };
  const envConfigContent = [
    "window._env_ = {",
    ...Object.entries(envVariables).map(
      ([key, value]) => `  ${key}: "${value}",`
    ),
    "};",
    `launchDarklyLocalFlags='${unescapeDoubleQuotes(envVariables["LD_LOCAL_FLAGS"])}'`,
    `launchDarklyServer='${envVariables["LD_SDK_KEY"]}'`,
  ].join("\n");

  await fs.writeFile(configFilePath, envConfigContent);
};
