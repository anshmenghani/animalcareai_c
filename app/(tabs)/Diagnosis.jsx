import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';
import * as DocumentPicker from 'expo-document-picker';

const models = [
  {
    name: "Eyes",
    url: "https://teachablemachine.withgoogle.com/models/7Qp3vM7LP/"
  },
  {
    name: "Skin",
    url: "https://teachablemachine.withgoogle.com/models/0Z1Q_MSsq/"
  },
  {
    name: "Mouth",
    url: "https://teachablemachine.withgoogle.com/models/SlnZaYHKt/"
  },
  {
    name: "Ears", // New model for ears
    url: "https://teachablemachine.withgoogle.com/models/dO9qW6SBy/" // Ears model URL
  }
];

export default function App() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [prediction, setPrediction] = useState(null);
  const [currentModelIndex, setCurrentModelIndex] = useState(3); // Start with Ears model
  const [modalVisible, setModalVisible] = useState(false);
  const ref = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function getPrediction(link, img) {
    await tf.ready();
    const modelURL = link + 'model.json';
    const metadataURL = link + 'metadata.json';
    const model = await tmImage.load(modelURL, metadataURL);

    let pic = await new Promise((resolve) => {
      let image = new Image();
      image.src = img.uri;
      image.onload = () => resolve(image);
    });

    let prediction = await model.predict(pic);
    console.log(prediction);
    setPrediction(prediction);
  }

  async function uploadFiles() {
    let result = await DocumentPicker.getDocumentAsync({ type: "image/*" });
    let result_part = result.assets[0];
    getPrediction(models[currentModelIndex].url, result_part);
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    let photo = await ref.current.takePictureAsync();
    getPrediction(models[currentModelIndex].url, photo);
  }

  function closePrediction() {
    setPrediction(null);
  }

  function openModelSelection() {
    setModalVisible(true);
  }

  function selectModel(index) {
    setCurrentModelIndex(index);
    setModalVisible(false);
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={ref}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={uploadFiles}>
            <MaterialIcons name="upload-file" size={36} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <MaterialIcons name="camera-alt" size={56} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-outline" size={36} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.switchModelButton} onPress={openModelSelection}>
          <MaterialIcons name="swap-horizontal-circle" size={36} color="white" />
        </TouchableOpacity>
      </CameraView>

      {prediction && (
        <View style={styles.predictionOverlay}>
          <View style={styles.predictionContainer}>
            <Text style={styles.predictionText}>Prediction:</Text>
            {prediction.map((p, index) => (
              <Text key={index} style={styles.predictionDetail}>
                {p.className}: {(p.probability * 100).toFixed(2)}%
              </Text>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={closePrediction}>
              <Text style={styles.closeButtonText}>Close Prediction</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal for Model Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Model</Text>
            {models.map((model, index) => (
              <TouchableOpacity key={index} style={styles.modelOption} onPress={() => selectModel(index)}>
                <Text style={styles.modelText}>{model.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
    paddingBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    alignItems: 'center',
    padding: 10,
  },
  captureButton: {
    backgroundColor: '#40c4c1',
    borderRadius: 40, // Circular button
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -40,
    elevation: 5,
  },
  switchModelButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#40c4c1',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
  },
  predictionOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  predictionContainer: {
    backgroundColor: '#d1f6f2', // Main color
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#00b3a8',
    height: '60%',
  },
  predictionText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 60,
    textAlign: 'center',
  },
  predictionDetail: {
    fontSize: 20,
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  closeButton: {
    marginTop: 50,
    backgroundColor: '#40c4c1',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 25,
    elevation: 4,
  },
  closeButtonText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: '#40c4c1',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#d1f6f2',
    padding: 30,
    borderRadius: 12,
    marginHorizontal: 20,
    height: '70%', // Increased height
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 34,
    color: 'black',
    marginBottom: 20, // Adjusted margin
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modelOption: {
    paddingVertical: 15,
    marginBottom: 20, // Increased spacing between options
    // Removed borderBottomWidth for a cleaner look
    backgroundColor: '#40c4c1',
    borderRadius: 12,
    paddingVertical: 20,
  },
  modelText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 1,
    backgroundColor: '#40c4c1',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    elevation: 4,
    marginBottom: 10,
  },
  closeModalText: {
    color: 'black', // Changed to black for better visibility
    fontWeight: 'bold',
    fontSize: 20, // Increased font size
    textAlign: 'center',
    paddingHorizontal: 80,
    paddingVertical: 10,
  },
  optionButton: {
    backgroundColor: '#40c4c1', // Same main color for consistency
    borderRadius: 30, // Circular button
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 15, // Spacing between buttons
    alignSelf: 'center',
    elevation: 4,
  },
  optionButtonText: {
    color: '#000000', // Black text for contrast
    fontWeight: 'bold',
    fontSize: 18, // Font size for options
    textAlign: 'center',
  },
});