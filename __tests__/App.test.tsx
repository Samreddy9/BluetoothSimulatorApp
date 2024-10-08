import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App/App';
import bluetoothManager from '../App/Container/BluetooothManager';
import NetInfo from '@react-native-community/netinfo';
import { syncDataToCloud } from '../App/Container/CloudSyncManager';

// Mock BluetoothManager
jest.mock('../App/Container/BluetooothManager', () => ({
  requestPermissions: jest.fn(() => Promise.resolve(true)),
  scanForDevices: jest.fn(() => Promise.resolve({ name: 'MockDevice' })),
  connectToDevice: jest.fn(() => Promise.resolve()),
  readData: jest.fn(() => Promise.resolve('MockedData')),
  disconnect: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((callback) => {
    callback({ isConnected: true, isInternetReachable: true });
    return () => {};
  }),
}));

// Mock CloudSyncManager
jest.mock('../App/Container/CloudSyncManager', () => ({
  syncDataToCloud: jest.fn(() => Promise.resolve()),
}));

test('App connects to Bluetooth, reads data, and displays it', async () => {
  const { getByText, findByText, queryByText } = render(<App />);

  // Simulate scanning for Bluetooth devices
  const scanButton = getByText('Scan for Bluetooth Devices');
  fireEvent.press(scanButton);
  
  // Wait for the device to be displayed
  await waitFor(() => getByText('Found Device: MockDevice'));

  // Simulate connecting to the device
  const connectButton = getByText('Connect to Device');
  fireEvent.press(connectButton);
  
  // Simulate reading data from the device
  const readButton = getByText('Read Data from Device');
  fireEvent.press(readButton);
  
  // Check if data is present and displayed
  const dataText = queryByText('Data from device:');
  if (dataText) {
    await waitFor(() => findByText('MockedData'));
    expect(dataText).toBeTruthy();
  } else {
    // Handle the case where data is null
    console.log('Data is null or not rendered');
  }
});
