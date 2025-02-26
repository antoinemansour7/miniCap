import { Stack } from "expo-router";


export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login" options={{ title: "Login"}} />
        <Stack.Screen name="auth/register" options={{title: 'Register'}} />
    </Stack>
  );
}