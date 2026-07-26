import {
  buildCommandCenterSnapshot,
  type CommandCenterSnapshot,
} from "@/domain/command-center";

export function getCommandCenterSnapshot(): CommandCenterSnapshot {
  return buildCommandCenterSnapshot();
}
