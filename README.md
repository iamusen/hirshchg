# Hirshfeld Charge Database

## 📋 Features

- ✨ **Modern Beautiful Interface** - Gradient design with responsive layout
- 📊 **Data Statistics Dashboard** - Real-time database statistics display
- 🔍 **Search Function** - Search materials by formula or MP-ID
- 📄 **Paginated Browsing** - Efficiently browse 5,080 material entries
- 🔬 **Detailed Information Display** - View structure, Hirshfeld charges, calculation details
- 🌐 **Materials Project Links** - Direct links to MP database

## 🚀 Quick Start

### Method 1: Using Startup Script (Recommended)

```bash
./start.sh
```

### Method 2: Direct Run

```bash
/Users/limusen/app/anaconda3/bin/python app.py
```

After starting, visit in your browser: **http://127.0.0.1:5000**

## 📦 Project Structure

```
.
├── app.py                  # Flask backend application
├── start.sh               # Startup script
├── requirements.txt       # Python dependencies
├── data/
│   └── h.db              # ASE database file (5,080 entries)
├── templates/
│   └── index.html        # Frontend HTML template
└── static/
    ├── css/
    │   └── style.css     # Stylesheet
    └── js/
        └── app.js        # JavaScript logic
```

## 🔧 Dependencies

- Python 3.x
- Flask
- ASE (Atomic Simulation Environment)
- NumPy

Dependencies are automatically installed to: `/Users/limusen/app/anaconda3`

## 📊 Database Information

- **Total Entries**: 5,080
- **Unique Formulas**: 4,742
- **Element Types**: 77
- **Average Atoms**: 6.2
- **Data Types**: Hirshfeld, Hirshfeld-I, Relative Volume

## 🎨 Interface Functions

### 1. Statistics Dashboard
Displays key database statistics:
- Total entries
- Unique formulas count
- Element types included
- Average atoms per structure
- Average band gap
- Metallic/Semiconductor count

### 2. Search & Filter
- Search by chemical formula (e.g., LaS, Cu2Ti2As2Si2)
- Search by Materials Project ID (e.g., mp-2350)
- Real-time search results update

### 3. Data List
Paginated display of all entries, including:
- ID, Formula, MP-ID
- Number of atoms, Band gap
- Material type (Metallic/Semiconductor)
- Calculation status

### 4. Detailed Information View
Click "View Details" to see:
- **Basic Information**: Formula, MP-ID, atoms, band gap
- **Structure Information**: Element composition, cell parameters, periodic boundary conditions
- **Hirshfeld Charge Analysis**:
  - Hirshfeld charges
  - Hirshfeld-I charges
  - Relative volume data
- **Calculation Details**: Forces on atoms, stress tensor, magnetic moments

## 🌐 API Endpoints

### Get Statistics
```
GET /api/stats
```

### Get Entry List
```
GET /api/entries?page=1&per_page=50&search=LaS
```

### Get Single Entry Details
```
GET /api/entry/<id>
```

## 🛑 Stop Server

Press `Ctrl + C` in the terminal to stop the server

Or use command:
```bash
pkill -f "python app.py"
```

## 💡 Usage Tips

1. **Browse Data**: Homepage automatically loads first 50 entries, use pagination buttons for more
2. **Search Materials**: Enter formula or MP-ID in search box, click Search
3. **View Details**: Click "View Details" button for any entry
4. **Link to MP**: Click MP-ID to jump directly to Materials Project website
5. **Expand Data**: In details page, click sections to expand and view complete data

## 🎯 Tech Stack

- **Backend**: Flask (Python)
- **Data Processing**: ASE, NumPy
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Design**: Responsive design, modern gradient UI

## 📝 Notes

- Server runs locally on `127.0.0.1:5000`, accessible only from local machine
- Database file located at `data/h.db`, contains pre-calculated Hirshfeld charge data
- First load of statistics may take a few seconds (needs to traverse all 5,080 entries)

## 🐛 Troubleshooting

**Port Occupied**:
```bash
# Find process occupying port 5000
lsof -ti:5000
# Terminate process
kill -9 $(lsof -ti:5000)
```

**Python Environment Issues**:
Ensure correct Python path is used: `/Users/limusen/app/anaconda3/bin/python`

---

**Version**: 1.0.0  
**Update Date**: 2026-07-03
