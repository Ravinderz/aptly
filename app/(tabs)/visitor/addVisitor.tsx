import { Calendar, Clock } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const AddVisitor = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      visitorName: "",
      contactNumber: "",
      visitDate: "",
      visitTime: "",
      visitPurpose: "",
    },
  });
  const onSubmit = (data: any) => console.log(data);

  return (
    <View
      className="flex h-full p-4 mb-8"
      style={{ backgroundColor: "#f8fafc" }}
    >
      <View className="mb-2">
        <Text className="block text-md font-medium text-gray-700 mb-2">
          Visitor Name
        </Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Visitor Name"
              cursorColor={"#6366f1"}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="w-full p-4 border border-border-color rounded-lg mb-2 bg-primary/10 text-primary text-lg "
              placeholderTextColor="#9CA3AF"
            />
          )}
          name="visitorName"
        />
        {errors.visitorName && (
          <Text className="text-red-500 mb-2">This is required.</Text>
        )}
      </View>
      <View className="mb-2">
        <Text className="block text-md font-medium text-gray-700 mb-2">
          Contact Number
        </Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Contact Number"
              cursorColor={"#6366f1"}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="w-full p-4 border border-border-color rounded-lg mb-2 bg-primary/10 text-primary text-lg"
              placeholderTextColor="#9CA3AF"
            />
          )}
          name="contactNumber"
        />
        {errors.contactNumber && (
          <Text className="text-red-500 mb-2">This is required.</Text>
        )}
      </View>

      <View className="flex flex-row gap-2 items-center justify-between mb-2">
        <View className="flex-1">
          <Text className="block text-md font-medium text-gray-700 mb-2">
            Visit Date
          </Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="dd/mm/yyyy"
                cursorColor={"#6366f1"}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="w-full p-4 border border-border-color rounded-lg mb-2 bg-primary/10 text-primary text-lg"
                placeholderTextColor="#6b7280"
              />
            )}
            name="visitDate"
          />
          {errors.visitDate && (
            <Text className="text-red-500 mb-2">This is required.</Text>
          )}
          <View className="absolute right-4 top-11">
            <Calendar size={24} color="#6366f1" />
          </View>
        </View>
        <View className="flex-1 relative">
          <Text className="block text-md font-medium text-gray-700 mb-2">
            Visit Time
          </Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                cursorColor={"#6366f1"}
                placeholder="--:-- --"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="w-full p-4 border border-border-color rounded-lg mb-2 bg-primary/10 text-primary text-lg"
                placeholderTextColor="#6b7280"
              />
            )}
            name="visitTime"
          />
          {errors.visitTime && (
            <Text className="text-red-500 mb-2">This is required.</Text>
          )}
          <View className="absolute right-4 top-11">
            <Clock size={24} color="#6366f1" />
          </View>
        </View>
      </View>
      <View className="mb-2">
        <Text className="block text-md font-medium text-gray-700 mb-2">
          Purpose of Visit
        </Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Purpose of Visit"
              cursorColor={"#6366f1"}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="w-full p-4 border border-border-color rounded-lg mb-2 bg-primary/10 text-primary text-lg"
              placeholderTextColor="#9CA3AF"
            />
          )}
          name="visitPurpose"
        />
        {errors.visitPurpose && (
          <Text className="text-red-500 mb-2">This is required.</Text>
        )}
      </View>

      <TouchableOpacity
        className="bg-primary w-full p-4 rounded-lg my-4"
        onPress={() => {
          // Handle the form submission
          handleSubmit(onSubmit)();
        }}
      >
        <Text className="text-white text-center font-medium text-xl">
          Submit
        </Text>
      </TouchableOpacity>

      {/* <Button title="Submit" onPress={handleSubmit(onSubmit)} /> */}
    </View>
  );
};

export default AddVisitor;
