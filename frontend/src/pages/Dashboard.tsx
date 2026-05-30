import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Device {
  id: string | number;
  name: string;
  status: boolean;
  type: string;
  icon: string;
  room: string;
  power?: number;
}

interface Stats {
  activeDevices: number;
  totalDevices: number;
  totalPower: number;
  temperature: number;
  humidity: number;
}

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Lampu Ruang Tamu',
      status: true,
      type: 'light',
      icon: '💡',
      room: 'Ruang Tamu',
      power: 10
    },
    {
      id: '2',
      name: 'AC Kamar Tidur',
      status: true,
      type: 'ac',
      icon: '❄️',
      room: 'Kamar Tidur',
      power: 950
    },
    {
      id: '3',
      name: 'Mesin Cuci',
      status: false,
      type: 'washing_machine',
      icon: '🌊',
      room: 'Dapur',
      power: 0
    },
    {
      id: '4',
      name: 'Kulkas',
      status: true,
      type: 'fridge',
      icon: '❄️',
      room: 'Dapur',
      power: 150
    },
    {
      id: '5',
      name: 'TV Ruang Keluarga',
      status: true,
      type: 'tv',
      icon: '📺',
      room: 'Ruang Keluarga',
      power: 120
    },
    {
      id: '6',
      name: 'Pemanas Air',
      status: false,
      type: 'heater',
      icon: '🔥',
      room: 'Kamar Mandi',
      power: 0
    }
  ]);

  const [stats, setStats] = useState<Stats>({
    activeDevices: 4,
    totalDevices: 6,
    totalPower: 1230,
    temperature: 24,
    humidity: 65
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/devices`);
      if (response.data) {
        console.log('Devices loaded:', response.data);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDevice = (id: string | number) => {
    setDevices(devices.map(device => {
      if (device.id === id) {
        const newStatus = !device.status;
        const newPower = newStatus ? (device.power || 100) : 0;
        
        // Update stats
        const newActiveDevices = devices.filter(d => d.id !== id && d.status).length + (newStatus ? 1 : 0);
        const newTotalPower = stats.totalPower - (device.power || 0) + newPower;
        
        setStats({
          ...stats,
          activeDevices: newActiveDevices,
          totalPower: newTotalPower
        });

        return { ...device, status: newStatus };
      }
      return device;
    }));
  };

  const totalPower = devices
    .filter(d => d.status)
    .reduce((sum, device) => sum + (device.power || 0), 0);

  const activeDevices = devices.filter(d => d.status).length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Rumah Pintar</h1>
        <p>Kelola semua perangkat Anda dari satu tempat</p>
      </div>

      <div className="dashboard-grid">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">📱</div>
            <div className="stat-content">
              <p className="stat-label">Perangkat Aktif</p>
              <p className="stat-value">{activeDevices}/{devices.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <p className="stat-label">Daya Terpakai</p>
              <p className="stat-value">{totalPower}W</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌡️</div>
            <div className="stat-content">
              <p className="stat-label">Suhu Rumah</p>
              <p className="stat-value">{stats.temperature}°C</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💧</div>
            <div className="stat-content">
              <p className="stat-label">Kelembaban</p>
              <p className="stat-value">{stats.humidity}%</p>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Aksi Cepat</h3>
          <div className="actions-grid">
            <button className="action-btn">
              <span className="action-icon">🏠</span>
              <span className="action-label">Semua ON</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🔌</span>
              <span className="action-label">Semua OFF</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">😴</span>
              <span className="action-label">Mode Tidur</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🚪</span>
              <span className="action-label">Mode Keluar</span>
            </button>
          </div>
        </div>

        <div className="weather-widget">
          <h3>Cuaca Hari Ini</h3>
          <div className="weather-content">
            <div className="weather-icon">☀️</div>
            <div className="weather-info">
              <p className="weather-temp">28°C</p>
              <p className="weather-desc">Cerah</p>
            </div>
          </div>
          <p className="weather-details">Kelembaban: 65% | Angin: 10 km/h</p>
        </div>

        <div className="energy-chart">
          <h3>Penggunaan Energi (24 Jam)</h3>
          <div className="chart-container">
            {[
              { time: '00:00', usage: 200 },
              { time: '06:00', usage: 500 },
              { time: '12:00', usage: 1200 },
              { time: '18:00', usage: 1500 },
              { time: '24:00', usage: 300 }
            ].map((item, idx) => (
              <div key={idx} className="chart-bar">
                <div className="bar" style={{ height: `${(item.usage / 1500) * 100}%` }}></div>
                <p>{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="devices-section">
        <h2>Perangkat Rumah</h2>
        <div className="devices-grid">
          {devices.map(device => (
            <div key={device.id} className={`device-card ${device.status ? 'active' : 'inactive'}`}>
              <div className="device-icon">{device.icon}</div>
              <div className="device-info">
                <h3>{device.name}</h3>
                <p className="device-room">{device.room}</p>
                {device.power && <p className="device-power">{device.power}W</p>}
              </div>
              <div className="device-toggle">
                <button
                  className={`toggle-btn ${device.status ? 'on' : 'off'}`}
                  onClick={() => handleToggleDevice(device.id)}
                >
                  {device.status ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
