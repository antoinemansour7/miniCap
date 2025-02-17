import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import "react-native-get-random-values";


export default function Home() {

  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect( () =>  {
    let timeOut = setTimeout( () => {
      setIsReady(true);
      router.replace("/screens/map");
    }, 100);
    return () => clearTimeout(timeOut);
  },[]);

if (!isReady){
  return   (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#800000" />
    </View>
  );}
  return null;
}

