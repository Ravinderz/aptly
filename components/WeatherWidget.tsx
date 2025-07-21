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
        return <Sun size={24} className="text-warning" />;
      case 'cloudy':
        return <Cloud size={24} className="text-text-secondary" />;
      case 'rainy':
        return <CloudRain size={24} className="text-primary" />;
      default:
        return <Sun size={24} className="text-warning" />;
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
          <Text className="text-text-secondary text-body-medium mb-1">
            {weather.location}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-display-large text-text-primary mr-2">
              {weather.temperature}°
            </Text>
            {getWeatherIcon(weather.condition)}
          </View>
          <Text className="text-text-secondary text-body-medium">
            {getConditionText(weather.condition)}
          </Text>
        </View>
        
        <View className="items-end">
          <View className="flex-row items-center mb-1">
            <Thermometer size={16} className="text-text-secondary" />
            <Text className="text-text-secondary text-label-large ml-1">
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