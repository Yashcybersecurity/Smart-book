# Google Maps Places API Integration Guide

## 🎯 Overview

The RideCompare application now includes **Google Maps Places Autocomplete** functionality, providing intelligent location suggestions as users type in the pickup and destination fields.

## 🔑 Getting Your API Key

To enable the autocomplete feature, you need a Google Maps API key. Follow these steps:

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `RideCompare` (or any name you prefer)
4. Click **"Create"**

### Step 2: Enable the Places API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Places API"**
3. Click on **"Places API"**
4. Click **"Enable"**

### Step 3: Create API Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. Your API key will be generated (looks like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. **IMPORTANT**: Click **"Restrict Key"** to secure it

### Step 4: Restrict Your API Key (Security)

For development/testing:
1. Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**
2. Add these referrers:
   - `http://localhost/*`
   - `file:///*` (for local file testing)
   - `https://yourdomain.com/*` (if deploying to a website)

For API restrictions:
1. Select **"Restrict key"**
2. Choose **"Places API"** from the dropdown
3. Click **"Save"**

### Step 5: Add API Key to Your Application

1. Open `index.html` in a text editor
2. Find this line (around line 11):
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
   ```
3. Replace `YOUR_API_KEY` with your actual API key:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&libraries=places"></script>
   ```
4. Save the file

## ✨ Features Implemented

### 1. **Autocomplete for Both Fields**
- Pickup location input has autocomplete
- Destination input has autocomplete
- Both work independently

### 2. **India-Specific Results**
- Results are restricted to locations in India
- Uses `componentRestrictions: { country: 'in' }`
- Perfect for Bangalore, Mumbai, Delhi, etc.

### 3. **Smart Location Types**
- Supports establishments (restaurants, malls, airports)
- Supports addresses (street addresses, neighborhoods)
- Covers all common pickup/destination types

### 4. **Custom Styling**
- Autocomplete dropdown matches app design
- Uses Inter font family
- Blue highlight for matched text
- Smooth hover effects
- Rounded corners and shadows

### 5. **Automatic Address Formatting**
- When user selects a suggestion, the full formatted address is filled in
- Ensures consistent address format
- Improves accuracy for fare calculations

## 🧪 Testing the Integration

### Test Without API Key (Current State)
- The app will work normally but without autocomplete
- Console will show: "Google Maps API not loaded. Autocomplete disabled."
- Users can still type locations manually
- All other features work perfectly

### Test With API Key
1. Add your API key as described above
2. Open `index.html` in a browser
3. Click on the **Pickup Location** field
4. Start typing: "Koramangala"
5. You should see a dropdown with suggestions:
   - Koramangala, Bangalore, Karnataka, India
   - Koramangala 1st Block, Bangalore...
   - Koramangala 6th Block, Bangalore...
6. Click any suggestion to auto-fill
7. Repeat for **Destination** field

### Example Test Searches

**Bangalore Locations:**
- Type: "Koramangala" → Select "Koramangala, Bangalore, Karnataka, India"
- Type: "Kempegowda" → Select "Kempegowda International Airport, Bangalore"
- Type: "MG Road" → Select "MG Road, Bangalore, Karnataka, India"
- Type: "Indiranagar" → Select "Indiranagar, Bangalore, Karnataka, India"

**Other Cities:**
- Type: "Connaught" → Select "Connaught Place, New Delhi, Delhi, India"
- Type: "Marine Drive" → Select "Marine Drive, Mumbai, Maharashtra, India"
- Type: "Anna Nagar" → Select "Anna Nagar, Chennai, Tamil Nadu, India"

## 💰 Pricing Information

### Google Maps Places API Pricing
- **Free Tier**: $200 credit per month (covers ~100,000 autocomplete requests)
- **Autocomplete Cost**: ~$2.83 per 1,000 requests (after free tier)
- **For Personal/Portfolio Projects**: Free tier is more than enough
- **For Production**: Monitor usage in Google Cloud Console

### Cost Optimization Tips
1. **Session Tokens**: Already implemented (reduces cost by ~60%)
2. **Field Restrictions**: Only requesting necessary fields (formatted_address, geometry, name)
3. **Debouncing**: Consider adding if you expect very high traffic
4. **Caching**: Store recent searches in localStorage (already implemented)

## 🔒 Security Best Practices

### ✅ DO:
- Restrict API key to specific domains/referrers
- Restrict API key to only Places API
- Monitor usage in Google Cloud Console
- Set up billing alerts
- Use environment variables for production

### ❌ DON'T:
- Share your API key publicly
- Commit API key to public GitHub repositories
- Leave API key unrestricted
- Use the same key for multiple projects

## 🚀 Deployment Options

### Option 1: Local Development (Current)
```html
<!-- Works with file:/// protocol -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```
Add `file:///*` to HTTP referrers in API restrictions.

### Option 2: Static Hosting (GitHub Pages, Netlify, Vercel)
```html
<!-- Add your domain to referrers -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```
Add `https://yourusername.github.io/*` to HTTP referrers.

### Option 3: Environment Variables (Recommended for Production)
For frameworks like React, Next.js, or build tools:
```javascript
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
```

## 🐛 Troubleshooting

### Issue: Autocomplete not showing
**Solution:**
1. Check browser console for errors
2. Verify API key is correct
3. Ensure Places API is enabled in Google Cloud Console
4. Check API key restrictions allow your domain/localhost

### Issue: "This page can't load Google Maps correctly"
**Solution:**
1. API key is invalid or restricted
2. Places API not enabled
3. Billing not set up (required even for free tier)

### Issue: Suggestions are for wrong country
**Solution:**
- Check `componentRestrictions: { country: 'in' }` is set correctly
- This is already configured for India

### Issue: Console warning about API key
**Solution:**
- Replace `YOUR_API_KEY` with actual API key
- If you don't have an API key, the app still works without autocomplete

## 📝 Code Explanation

### HTML (Line 11)
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```
- Loads Google Maps JavaScript API
- `libraries=places` enables Places library
- Must be in `<head>` before other scripts

### CSS (Lines 166-197)
```css
.pac-container {
    font-family: 'Inter', ...;
    border-radius: 12px;
    box-shadow: var(--shadow-lg);
}
```
- Styles the autocomplete dropdown
- Matches app's design system
- `.pac-container` is Google's autocomplete container class

### JavaScript (Lines 794-838)
```javascript
function initAutocomplete() {
    const options = {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name'],
        types: ['establishment', 'geocode']
    };
    
    pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, options);
    // ... event listeners
}
```
- Initializes autocomplete for both input fields
- Restricts to India
- Listens for place selection
- Auto-fills formatted address

## 🎨 Customization Options

### Change Country Restriction
```javascript
componentRestrictions: { country: 'us' } // United States
componentRestrictions: { country: 'gb' } // United Kingdom
```

### Change Location Types
```javascript
types: ['geocode'] // Only addresses
types: ['establishment'] // Only businesses/landmarks
types: [] // All types (default)
```

### Add Bias to Specific City
```javascript
const options = {
    componentRestrictions: { country: 'in' },
    bounds: {
        north: 13.0827,
        south: 12.8344,
        east: 77.7411,
        west: 77.4601
    }, // Bangalore bounds
    strictBounds: false
};
```

## ✅ Integration Checklist

- [x] Google Maps script added to HTML
- [x] Autocomplete initialization code added
- [x] Event listeners for place selection
- [x] Custom CSS styling for dropdown
- [x] India country restriction
- [x] Error handling (graceful degradation)
- [x] Both pickup and destination fields
- [ ] **Get Google Maps API key** (user action required)
- [ ] **Replace YOUR_API_KEY in index.html** (user action required)
- [ ] **Test autocomplete functionality** (after API key added)

## 🎯 Next Steps

1. **Get your API key** following the steps above
2. **Replace `YOUR_API_KEY`** in line 11 of `index.html`
3. **Open the app** in a browser
4. **Test autocomplete** by typing in the location fields
5. **Enjoy enhanced UX** with smart location suggestions!

## 📚 Additional Resources

- [Google Maps Places API Documentation](https://developers.google.com/maps/documentation/javascript/places-autocomplete)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Places API Pricing](https://developers.google.com/maps/billing-and-pricing/pricing#places)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**File Location**: [index.html](file:///C:/Users/ASUS/Documents/smartbook/index.html)  
**Status**: ✅ Integration Complete (API key required to activate)  
**Last Updated**: 2026-01-27
