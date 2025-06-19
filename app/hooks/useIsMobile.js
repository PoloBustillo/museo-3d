import { useDevice } from "../../providers/DeviceProvider";
export default function useIsMobile() {
  const { isMobile } = useDevice();
  return isMobile;
}
