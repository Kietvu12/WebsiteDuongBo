import React, { useState } from 'react'
import './GPMBSheet.css'
const GPMBSheet = () => {
    const [data, setData] = useState([
        {
          stt: 3,
          duAn: 'Vũng Áng - Bùng (53.34 Km)',
          banQLDA: 'Ban 6',
          tenGoiThau: 'XL01',
          lyTrinh: 'Km568+200 - Km600+',
          chieuDaiGoiThau: 31.8,
          giaGoiThau: '4,940,000,000,000',
          tinhHinh: [
            {
              tinh: 'Hà Tĩnh',
              chieuDai: 12.9,
              tienDo: [
                { ngay: '09/12/2022', km: 10.3, tyLe: '80%' },
                { ngay: '16/12/2022', km: 10.3, tyLe: '80%' },
                { ngay: '22/12/2022', km: 10.3, tyLe: '80%' },
                { ngay: '27/12/2022', km: 10.3, tyLe: '80%' },
                { ngay: '05/01/2022', km: 12.8, tyLe: '99%' },
                { ngay: '10/01/2022', km: 12.8, tyLe: '99%' },
              ],
              baoCao: 12.9,
              thiCong: 12.9,
            },
            {
              tinh: 'Quảng Bình',
              chieuDai: 42.44,
              tienDo: [
                { ngay: '09/12/2022', km: 11.5, tyLe: '27%' },
                { ngay: '16/12/2022', km: 11.5, tyLe: '27%' },
                { ngay: '22/12/2022', km: 11.5, tyLe: '27%' },
                { ngay: '27/12/2022', km: 11.5, tyLe: '27%' },
                { ngay: '05/01/2022', km: 11.5, tyLe: '27%' },
                { ngay: '10/01/2022', km: 11.5, tyLe: '27%' },
              ],
              baoCao: 42.44,
              thiCong: 42.44,
            }
          ]
        }
      ]);
    
      const [editing, setEditing] = useState(null);
      const [editValue, setEditValue] = useState('');
    
      const handleExport = () => {
        alert("Xuất dữ liệu thành công!");
      };
    
      const startEditing = (path, value) => {
        setEditing(path);
        setEditValue(value);
      };
    
      const saveEdit = () => {
        const [rowIndex, tinhIndex, field, subIndex] = editing.split('-');
        const newData = [...data];
        
        if (subIndex !== undefined) {
          // Editing tienDo array
          if (field === 'km') {
            newData[rowIndex].tinhHinh[tinhIndex].tienDo[subIndex].km = parseFloat(editValue) || 0;
          } else if (field === 'tyLe') {
            newData[rowIndex].tinhHinh[tinhIndex].tienDo[subIndex].tyLe = editValue.includes('%') ? editValue : `${editValue}%`;
          }
        } else {
          // Editing regular fields
          if (field === 'chieuDai' || field === 'baoCao' || field === 'thiCong') {
            newData[rowIndex].tinhHinh[tinhIndex][field] = parseFloat(editValue) || 0;
          } else {
            newData[rowIndex].tinhHinh[tinhIndex][field] = editValue;
          }
        }
        
        setData(newData);
        setEditing(null);
      };
    
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          saveEdit();
        } else if (e.key === 'Escape') {
          setEditing(null);
        }
      };
    
      const renderCell = (value, path) => {
        if (editing === path) {
          return (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="edit-input"
            />
          );
        }
        return (
          <div 
            className="cell-content"
            onClick={() => startEditing(path, typeof value === 'number' ? value.toString() : value)}
          >
            {value}
          </div>
        );
      };
  return (
    <div className='container'>
        <h2>Phụ lục 1a – TÌNH HÌNH BÀN GIAO GPMB DỰ ÁN CAO TỐC BẮC - NAM (2021 - 2025)</h2>
        
              <table className="report-table">
                <thead>
                  <tr>
                    <th rowSpan={3}>TT</th>
                    <th rowSpan={3}>Dự án</th>
                    <th rowSpan={3}>Ban QLDA</th>
                    <th rowSpan={3}>Tên gói thầu</th>
                    <th rowSpan={3}>Lý trình</th>
                    <th rowSpan={3}>Chiều dài gói thầu (km)</th>
                    <th rowSpan={3}>Giá gói thầu</th>
                    <th rowSpan={1} colSpan={18}>Phạm vi theo tỉnh</th>
                  </tr>
                  <tr>
                    <th rowSpan={2}>Tỉnh</th>
                    <th rowSpan={2}>Chiều dài (km)</th>
                    {["09/12/2022", "16/12/2022", "22/12/2022", "27/12/2022", "05/01/2022", "10/01/2022"].map(date => (
                      <th key={date} colSpan={2}>Đã giao GPMB ({date})</th>
                    ))}
                    <th colSpan={2}>Khối lượng theo báo cáo</th>
                    <th colSpan={2}>Khối lượng có thể thi công</th>
                  </tr>
                  <tr>
                    {Array(6).fill(0).map((_, i) => (
                      <React.Fragment key={i}>
                        <th>Chiều dài (km)</th>
                        <th>Tỷ lệ (%)</th>
                      </React.Fragment>
                    ))}
                    <th>Chiều dài (km)</th>
                    <th>Tỷ lệ (%)</th>
                    <th>Chiều dài (km)</th>
                    <th>Tỷ lệ (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, rowIndex) =>
                    item.tinhHinh.map((tinh, tinhIndex) => (
                      <tr key={`${rowIndex}-${tinhIndex}`}>
                        {tinhIndex === 0 && (
                          <>
                            <td rowSpan={2}>{item.stt}</td>
                            <td rowSpan={2}>{item.duAn}</td>
                            <td rowSpan={2}>{item.banQLDA}</td>
                            <td rowSpan={2}>{item.tenGoiThau}</td>
                            <td rowSpan={2}>{item.lyTrinh}</td>
                            <td rowSpan={2}>{item.chieuDaiGoiThau}</td>
                            <td rowSpan={2}>{item.giaGoiThau}</td>
                          </>
                        )}
                        <td>{tinh.tinh}</td>
                        <td>
                          {renderCell(tinh.chieuDai, `${rowIndex}-${tinhIndex}-chieuDai`)}
                        </td>
                        {tinh.tienDo.map((t, subIndex) => (
                          <React.Fragment key={subIndex}>
                            <td>
                              {renderCell(t.km, `${rowIndex}-${tinhIndex}-km-${subIndex}`)}
                            </td>
                            <td>
                              {renderCell(t.tyLe, `${rowIndex}-${tinhIndex}-tyLe-${subIndex}`)}
                            </td>
                          </React.Fragment>
                        ))}
                        <td>
                          {renderCell(tinh.baoCao, `${rowIndex}-${tinhIndex}-baoCao`)}
                        </td>
                        <td>100%</td>
                        <td>
                          {renderCell(tinh.thiCong, `${rowIndex}-${tinhIndex}-thiCong`)}
                        </td>
                        <td>100%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
    </div>
  )
}

export default GPMBSheet