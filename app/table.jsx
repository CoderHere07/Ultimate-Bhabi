import { useEffect, useState } from 'react';
import { useLocalSearchParams } from "expo-router";
import Table from "../src/components/Table.jsx";
import { auth } from "../backend/config/firebase";
import { userService } from "../backend/services/userService";

export default function Game() {
  const params = useLocalSearchParams();
  const [userProfile, setUserProfile] = useState({
    name: params.name || "You",
    emoji: params.emoji || "👤",
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const data = await userService.getUserProfile(auth.currentUser.uid);
        if (data) {
          const suitEmoji = data.selectedSuit === 'spade' ? '♠️' :
            data.selectedSuit === 'heart' ? '♥️' :
              data.selectedSuit === 'club' ? '♣️' : '♦️';
          setUserProfile({
            name: data.displayName || "You",
            emoji: suitEmoji,
          });
        }
      }
    };
    fetchUser();
  }, []);

  return <Table userProfile={userProfile} />;
}
