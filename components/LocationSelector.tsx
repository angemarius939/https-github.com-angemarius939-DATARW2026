import React, { useState, useMemo } from 'react';

export interface LocationData {
  Province_Name: string;
  District_Name: string;
  Sector_Name: string;
  Cell_Name: string;
  Village_Name: string;
}

interface LocationSelectorProps {
  locations: LocationData[];
  onLocationChange: (location: {
    province: string;
    district: string;
    sector: string;
    cell: string;
    village: string;
  }) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ locations, onLocationChange }) => {
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');

  const provinces = useMemo(() => {
    const set = new Set(locations.map(l => l.Province_Name));
    return Array.from(set).sort();
  }, [locations]);

  const districts = useMemo(() => {
    if (!selectedProvince) return [];
    const set = new Set(locations.filter(l => l.Province_Name === selectedProvince).map(l => l.District_Name));
    return Array.from(set).sort();
  }, [locations, selectedProvince]);

  const sectors = useMemo(() => {
    if (!selectedDistrict) return [];
    const set = new Set(locations.filter(l => l.District_Name === selectedDistrict).map(l => l.Sector_Name));
    return Array.from(set).sort();
  }, [locations, selectedDistrict]);

  const cells = useMemo(() => {
    if (!selectedSector) return [];
    const set = new Set(locations.filter(l => l.Sector_Name === selectedSector).map(l => l.Cell_Name));
    return Array.from(set).sort();
  }, [locations, selectedSector]);

  const villages = useMemo(() => {
    if (!selectedCell) return [];
    const set = new Set(locations.filter(l => l.Cell_Name === selectedCell).map(l => l.Village_Name));
    return Array.from(set).sort();
  }, [locations, selectedCell]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProvince(val);
    setSelectedDistrict('');
    setSelectedSector('');
    setSelectedCell('');
    setSelectedVillage('');
    notifyChange(val, '', '', '', '');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDistrict(val);
    setSelectedSector('');
    setSelectedCell('');
    setSelectedVillage('');
    notifyChange(selectedProvince, val, '', '', '');
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSector(val);
    setSelectedCell('');
    setSelectedVillage('');
    notifyChange(selectedProvince, selectedDistrict, val, '', '');
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCell(val);
    setSelectedVillage('');
    notifyChange(selectedProvince, selectedDistrict, selectedSector, val, '');
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedVillage(val);
    notifyChange(selectedProvince, selectedDistrict, selectedSector, selectedCell, val);
  };

  const notifyChange = (province: string, district: string, sector: string, cell: string, village: string) => {
    onLocationChange({ province, district, sector, cell, village });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1">Province</label>
        <select 
          className="p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedProvince} 
          onChange={handleProvinceChange}
        >
          <option value="">Select Province</option>
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1">District</label>
        <select 
          className="p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          value={selectedDistrict} 
          onChange={handleDistrictChange}
          disabled={!selectedProvince}
        >
          <option value="">Select District</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1">Sector</label>
        <select 
          className="p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          value={selectedSector} 
          onChange={handleSectorChange}
          disabled={!selectedDistrict}
        >
          <option value="">Select Sector</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1">Cell</label>
        <select 
          className="p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          value={selectedCell} 
          onChange={handleCellChange}
          disabled={!selectedSector}
        >
          <option value="">Select Cell</option>
          {cells.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1">Village</label>
        <select 
          className="p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          value={selectedVillage} 
          onChange={handleVillageChange}
          disabled={!selectedCell}
        >
          <option value="">Select Village</option>
          {villages.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    </div>
  );
};
