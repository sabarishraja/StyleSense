// Expo Router entry point — this file redirects to the closet tab
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(tabs)/closet" />;
}
