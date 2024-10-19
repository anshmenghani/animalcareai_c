import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import tmImage from '@teachablemachine/image';

console.log('tmImage:', tmImage); // Log to check if tmImage is defined

const Test = () => {
    const init = async () => {
        try {
            const URL = "https://teachablemachine.withgoogle.com/models/0Z1Q_MSsq/";
            const modelURL = URL + "model.json";
            const metadataURL = URL + "metadata.json";

            const model = await tmImage.load(modelURL, metadataURL);
            console.log("Model loaded:", model); // Log to confirm model loading
        } catch (error) {
            console.error('Error initializing:', error);
        }
    };

    return (
        <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Teachable Machine Image Model</Text>
            <Button title="Start" onPress={init} />
            <View id="webcam-container" style={{ marginTop: 20 }} />
            <View id="label-container" style={{ marginTop: 20 }} />
        </View>
    );
};

export default Test;
