import {
  buildDeviceDataNormalizationSnapshot,
  type DeviceDataNormalizationSnapshot,
} from "@/domain/device-data-normalization";

export function getDeviceDataNormalizationSnapshot(): DeviceDataNormalizationSnapshot {
  return buildDeviceDataNormalizationSnapshot();
}
