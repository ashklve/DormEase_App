import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { loadSession } from '../api/auth';

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [destination, setDestination] = useState('/welcome');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await loadSession();
        if (session?.user?.role === 'tenant') {
          setDestination('/tenant/dashboard');
        } else if (session?.user?.role === 'admin') {
          setDestination('/admin/dashboard');
        } else if (session?.user?.role === 'staff') {
          setDestination('/staff/dashboard');
        }
      } catch (_) {
        // no session, go to welcome
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, []);

  // show spinner while checking AsyncStorage
  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#CA5D86' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return <Redirect href={destination} />;
}