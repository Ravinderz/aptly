import React from 'react';
import { View, Text } from 'react-native';
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react-native';
import { Card } from './ui/Card';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  humidity: number;
  location: string;
}

export const WeatherWidget: React.FC = () => {
  // Mock weather data - replace with actual weather API
  const weather: WeatherData = {
    temperature: 28,
    condition: 'sunny',
    humidity: 65,
    location: 'Noida, UP'
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun size={24} color="#FF9800" />;
      case 'cloudy':
        return <Cloud size={24} color="#757575" />;
      case 'rainy':
        return <CloudRain size={24} color="#2196F3" />;
      default:
        return <Sun size={24} color="#FF9800" />;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return 'Sunny';
      case 'cloudy':
        return 'Cloudy';
      case 'rainy':
        return 'Rainy';
      default:
        return 'Clear';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-text-secondary text-sm mb-1">
            {weather.location}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-3xl font-bold text-text-primary mr-2">
              {weather.temperature}°
            </Text>
            {getWeatherIcon(weather.condition)}
          </View>
          <Text className="text-text-secondary text-sm">
            {getConditionText(weather.condition)}
          </Text>
        </View>
        
        <View className="items-end">
          <View className="flex-row items-center mb-1">
            <Thermometer size={14} color="#757575" />
            <Text className="text-text-secondary text-xs ml-1">
              Humidity
            </Text>
          </View>
          <Text className="text-text-primary font-semibold">
            {weather.humidity}%
          </Text>
        </View>
      </View>
    </Card>
  );
};

export default WeatherWidget;