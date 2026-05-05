import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: check AsyncStorage for saved token here
  // if token exists → router.replace('/tenant/dashboard')
  // if no token → go to welcome screen
  return <Redirect href="/welcome" />;
}