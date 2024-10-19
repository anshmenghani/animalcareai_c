import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, Text, TouchableOpacity, View, Modal } from 'react-native';
import * as tmImage from '@teachablemachine/image';

export default function App() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [modalVisible, setModalVisible] = useState(false);
  const [predictionResult, setPredictionResult] = useState('');
  const ref = useRef(null);

  if (!permission) {
    return <View className="flex-1 justify-center items-center bg-gray-100" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-6">
        <Text className="text-center text-lg text-gray-700 mb-4">
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text className="text-center text-blue-500">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function getPrediction(link, pic) {
    const URL = link;
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';
    let model = await tmImage.load(modelURL, metadataURL);

    const prediction = await model.predict(pic);
    setPredictionResult(prediction[0]?.className || 'Unknown'); // Assuming the first result is the most confident one
    setModalVisible(true); // Show the modal with the prediction result
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    let photo = await ref.current.takePictureAsync();
    await getPrediction(
      'https://teachablemachine.withgoogle.com/models/0Z1Q_MSsq/',
      photo
    );
    await ref.current.pausePreview();
  }

  return (
    <View className="flex-1 bg-gray-100">
      <CameraView className="flex-1" facing={facing} ref={ref} />

      {/* Flip Camera Button */}
      <TouchableOpacity
        className="absolute top-12 left-4 bg-white p-3 rounded-full shadow-md"
        onPress={toggleCameraFacing}
      >
        <Ionicons name="camera-reverse-outline" size={30} color="black" />
      </TouchableOpacity>

      {/* Take Picture Button */}
      <View className="absolute bottom-10 left-0 right-0 flex-row justify-center">
        <View className="bg-gray-200 p-8 rounded-full justify-center items-center">
          <TouchableOpacity
            className="bg-turquoise-600 p-5 rounded-full shadow-lg"
            onPress={takePicture}
          >
            <Ionicons name="camera-outline" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for Showing Prediction */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-gray-800 bg-opacity-50">
          <View className="bg-white p-6 rounded-lg shadow-lg w-3/4">
            <Text className="text-center text-xl font-bold text-black mb-4">
              Prediction Result
            </Text>
            <Text className="text-center text-lg text-gray-700 mb-4">
              {predictionResult}
            </Text>
            <TouchableOpacity
              className="bg-blue-500 p-3 rounded-full"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-center text-white font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
