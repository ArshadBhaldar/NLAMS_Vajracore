# VajraBhoomi (वज्रभूमि) — Field Surveyor Mobile API Specification
## REST API & Integration Guide for Native Android (Kotlin / Jetpack Compose)
### Target Application: VajraBhoomi Field Cadastral Inspector (Android App)

---

## 📌 Document Overview & Executive Summary

This document specifies the complete REST API contract, network architecture, and offline-first synchronization guidelines required by the Android Engineering Team building the **VajraBhoomi Field Surveyor Mobile Application** in **Kotlin**.

### Primary Mobile App Objectives
1. **Authentication & Jurisdiction**: Secure surveyor login, session management via signed JWTs, and district-scoped project assignment retrieval.
2. **Cadastral Queue & Map Visualization**: Display assigned acquisition corridors, cadastral parcels, and urban City Survey boundaries on interactive OpenStreetMap (OSM) / ESRI Satellite maps.
3. **High-Precision GNSS Ground-Truthing**: Capture real-time hardware GPS/GNSS fixes (latitude, longitude, altitude, horizontal accuracy) to verify boundary stones.
4. **Geotagged Photographic Evidence**: Capture field photos via CameraX, embed EXIF GPS tags, and stream multipart evidence to the backend.
5. **On-Site Statutory Verification Checklist**: Record inspection audits (boundary pillars, physical occupant verification, standing assets/crops, unnotified encroachments).
6. **Offline-First Synchronization**: Cache projects and parcels locally in Android Room database, queue field evidence when offline, and automatically sync to the District CALA Registry via Android WorkManager when connectivity resumes.

---

## 🌐 1. Environment & Base URL Configuration

### 1.1 Base URLs

| Environment | Base URL | Description |
| :--- | :--- | :--- |
| **Local Emulator** | `http://10.0.2.2:4000/api` | Default Android Emulator loopback to host development machine |
| **Physical Device (LAN)** | `http://<YOUR_LOCAL_IP>:4000/api` | Physical test device connected to the same Wi-Fi network (e.g. `http://192.168.1.15:4000/api`) |
| **Staging Server** | `https://staging-api.vajrabhoomi.gov.in/api` | Pre-production testing environment with SSL |
| **Production Server** | `https://api.vajrabhoomi.gov.in/api` | Production NIC Cloud (MeghRaj) environment |

### 1.2 Android Network Security Config (Cleartext HTTP for Local Dev)
In Android 9 (API 28) and above, cleartext HTTP is disabled by default. For local emulator and Wi-Fi testing, configure:

**`res/xml/network_security_config.xml`**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">192.168.1.0/24</domain>
    </domain-config>
</network-security-config>
```

**`AndroidManifest.xml`**:
```xml
<application
    android:name=".VajraBhoomiApp"
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="true"
    ... >
    <!-- Required Hardware Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
</application>
```

---

## 🔐 2. Authentication & Authorization Model

VajraBhoomi enforces **JWT (JSON Web Token)** Bearer authentication. 
- All protected endpoints require the HTTP Header:  
  `Authorization: Bearer <ACCESS_TOKEN>`
- Surveyor accounts possess the role `FIELD_SURVEYOR`, which grants:
  - `document:upload`: Upload geotagged field photos and verification attachments.
  - `parcel:view_assigned`: Inspect cadastral boundaries and survey plots.
- Tokens expire after **24 hours**. When an HTTP `401 Unauthorized` is encountered, the app must route the surveyor to the login screen.

### Standard Test Credentials for Development

| Field | Value |
| :--- | :--- |
| **Email** | `surveyor.anita@demo.gov.in` |
| **Password** | `Demo@1234` |
| **Role** | `FIELD_SURVEYOR` |
| **Assigned District** | `Pune` |
| **Department** | `Cadastral Survey Directorate` |

---

## 📡 3. REST API Endpoint Specifications

---

### 3.1 Authentication & Profile APIs

#### `POST /auth/login` — Surveyor Authentication
Authenticates the surveyor with email and password, returning a signed JWT token and user profile.

- **URL:** `POST /api/auth/login`
- **Auth Required:** No (Public)
- **Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "surveyor.anita@demo.gov.in",
  "password": "Demo@1234"
}
```

**Success Response (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1NTU1NTU1LTU1NTUtNTU1NS01NTU1LTU1NTU1NTU1NTU1NSIsImVtYWlsIjoic3VydmV5b3IuYW5pdGFAZGVtby5nb3YuaW4iLCJyb2xlIjoiRklFTERfU1VSVkVZT1IiLCJkaXN0cmljdCI6IlB1bmUiLCJpYXQiOjE3Mjk5NDIwMDB9...",
  "user": {
    "id": "55555555-5555-5555-5555-555555555555",
    "name": "Anita Kulkarni",
    "email": "surveyor.anita@demo.gov.in",
    "role": "FIELD_SURVEYOR",
    "district": "Pune"
  }
}
```

**Error Responses:**
- `400 Bad Request`: `{"error": "Email and password are required"}`
- `401 Unauthorized`: `{"error": "Invalid email or password"}`

---

#### `GET /auth/me` — Verify Active Session & User Profile
Retrieves the surveyor profile for the active JWT session. Use this during app startup to validate cached tokens.

- **URL:** `GET /api/auth/me`
- **Auth Required:** Yes (`Authorization: Bearer <TOKEN>`)

**Success Response (`200 OK`):**
```json
{
  "id": "55555555-5555-5555-5555-555555555555",
  "name": "Anita Kulkarni",
  "email": "surveyor.anita@demo.gov.in",
  "role": "FIELD_SURVEYOR",
  "district": "Pune"
}
```

---

### 3.2 Acquisition Projects & Corridors API

#### `GET /proposals` — List Assigned Acquisition Projects
Fetches all acquisition project proposals within the surveyor's active scope/district.

- **URL:** `GET /api/proposals`
- **Auth Required:** Yes
- **Query Parameters (Optional):**
  - `district` (string): e.g. `Pune`
  - `state` (string): e.g. `Maharashtra`

**Success Response (`200 OK`):**
```json
[
  {
    "id": "a1111111-1111-1111-1111-111111111111",
    "project_name": "Pune-Nashik Semi-High Speed Rail Corridor — Package IV",
    "requiring_body_id": "11111111-1111-1111-1111-111111111111",
    "district": "Pune",
    "state": "Maharashtra",
    "area_hectares": 450.50,
    "justification": "Direct passenger & agricultural express freight connectivity between Pune and Nashik industrial clusters.",
    "stage": "NOTIFIED_3A",
    "assigned_cala_id": "22222222-2222-2222-2222-222222222222",
    "created_at": "2026-09-15T10:30:00.000Z",
    "updated_at": "2026-09-20T14:15:00.000Z"
  },
  {
    "id": "b2222222-2222-2222-2222-222222222222",
    "project_name": "PM GatiShakti Multi-Modal Logistics Park (MMLP) — Talegaon Hub",
    "requiring_body_id": "11111111-1111-1111-1111-111111111111",
    "district": "Pune",
    "state": "Maharashtra",
    "area_hectares": 180.25,
    "stage": "DRAFT",
    "assigned_cala_id": "22222222-2222-2222-2222-222222222222",
    "created_at": "2026-09-18T11:00:00.000Z",
    "updated_at": "2026-09-18T11:00:00.000Z"
  }
]
```

---

#### `GET /proposals/{id}` — Get Specific Project Details
Retrieves full details of a specific project by UUID.

- **URL:** `GET /api/proposals/:id`
- **Auth Required:** Yes
- **Path Parameters:** `id` (UUID of project proposal)

**Success Response (`200 OK`):**
```json
{
  "id": "a1111111-1111-1111-1111-111111111111",
  "project_name": "Pune-Nashik Semi-High Speed Rail Corridor — Package IV",
  "requiring_body_id": "11111111-1111-1111-1111-111111111111",
  "district": "Pune",
  "state": "Maharashtra",
  "area_hectares": 450.50,
  "stage": "NOTIFIED_3A",
  "assigned_cala_id": "22222222-2222-2222-2222-222222222222",
  "justification": "Strategic rail corridor connectivity",
  "created_at": "2026-09-15T10:30:00.000Z",
  "updated_at": "2026-09-20T14:15:00.000Z"
}
```

---

### 3.3 Cadastral Parcels & Spatial Geometry APIs

#### `GET /parcels/proposal/{proposalId}` — List Parcels for a Project
Retrieves all demarcated land parcels belonging to a project proposal, including exact PostGIS GeoJSON polygon boundaries.

- **URL:** `GET /api/parcels/proposal/:proposalId`
- **Auth Required:** Yes
- **Path Parameters:** `proposalId` (UUID)

**Success Response (`200 OK`):**
```json
[
  {
    "id": "c3333333-3333-3333-3333-333333333333",
    "proposal_id": "a1111111-1111-1111-1111-111111111111",
    "ulpin": "MH1234567890",
    "owner_name": "Ganesh Patil",
    "citizen_id": "33333333-3333-3333-3333-333333333333",
    "claimed_area_sqm": 12000.00,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [73.8567, 18.5204],
          [73.8585, 18.5204],
          [73.8585, 18.5222],
          [73.8567, 18.5222],
          [73.8567, 18.5204]
        ]
      ]
    },
    "restricted_zone_overlap": false,
    "overlap_details": null,
    "created_at": "2026-09-16T09:00:00.000Z"
  }
]
```

> **Note on Coordinate Format:** PostGIS GeoJSON output follows RFC 7946 standard: `[Longitude, Latitude]` coordinates in WGS 84 (`EPSG:4326`).

---

#### `GET /cadastral/plots` — Query City Survey & Urban Plots
Fetches City Survey cadastral plots (Urban Cadastral Linkage module) formatted as a standard GeoJSON `FeatureCollection` for native rendering in Android map SDKs (MapLibre / OsmDroid).

- **URL:** `GET /api/cadastral/plots`
- **Auth Required:** Yes
- **Query Parameters (Optional):**
  - `ward`: Filter by ward/division (e.g. `Shivajinagar`)
  - `search`: Search by owner name or CTS number

**Success Response (`200 OK`):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "e4444444-4444-4444-4444-444444444444",
      "properties": {
        "ulpin": "MH26PU41100501",
        "owner_name": "Ganesh Patil",
        "cts_number": "CTS-142/A",
        "ward_division": "Shivajinagar Ward 4",
        "area_sqm": 12000.00,
        "property_card_url": "/sample_documents/Property_Card_CTS_142A.pdf",
        "dispute_status": "NONE"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [73.8567, 18.5204],
            [73.8585, 18.5204],
            [73.8585, 18.5222],
            [73.8567, 18.5222],
            [73.8567, 18.5204]
          ]
        ]
      }
    }
  ]
}
```

---

#### `GET /cadastral/plots/{ulpin}` — Fetch Specific Cadastral Plot by ULPIN
Lookup a plot directly by its 14-digit Bhu-Aadhaar ULPIN or CTS number.

- **URL:** `GET /api/cadastral/plots/:ulpin`
- **Auth Required:** Yes

**Success Response (`200 OK`):**
```json
{
  "id": "e4444444-4444-4444-4444-444444444444",
  "ulpin": "MH26PU41100501",
  "owner_name": "Ganesh Patil",
  "cts_number": "CTS-142/A",
  "ward_division": "Shivajinagar Ward 4",
  "area_sqm": 12000.00,
  "property_card_url": "/sample_documents/Property_Card_CTS_142A.pdf",
  "geometry": {
    "type": "Polygon",
    "coordinates": [...]
  }
}
```

---

### 3.4 Geotagged Field Evidence Upload & Verification API

#### `POST /documents` — Upload Field Survey Photo / Evidence
Uploads a high-resolution geotagged site inspection photo captured by the surveyor's camera.
- The backend automatically stores the photo, tracks the version, stamps an immutable audit log, and associates it with the proposal and parcel.

- **URL:** `POST /api/documents`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`

**Multipart Form Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | Binary File | **Yes** | Image file (`image/jpeg`, `image/png`) captured via camera |
| `proposal_id` | UUID String | **Yes** | Project proposal ID |
| `doc_type` | String | **Yes** | Must be `"SURVEY_PHOTO"` |
| `parcel_id` | UUID String | No | Parcel ID being verified (recommended) |
| `latitude` | Decimal String | No | GNSS latitude (e.g. `"18.520412"`) |
| `longitude` | Decimal String | No | GNSS longitude (e.g. `"73.856734"`) |
| `accuracy_m` | Decimal String | No | GPS fix accuracy in meters (e.g. `"3.2"`) |
| `notes` | String | No | Surveyor field observation notes |

**Curl Example:**
```bash
curl -X POST http://10.0.2.2:4000/api/documents \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/path/to/site_marker_photo.jpg" \
  -F "proposal_id=a1111111-1111-1111-1111-111111111111" \
  -F "parcel_id=c3333333-3333-3333-3333-333333333333" \
  -F "doc_type=SURVEY_PHOTO" \
  -F "latitude=18.520412" \
  -F "longitude=73.856734" \
  -F "accuracy_m=3.5" \
  -F "notes=Boundary stone #4 verified intact. No structural encroachment."
```

**Success Response (`201 Created`):**
```json
{
  "id": "d5555555-5555-5555-5555-555555555555",
  "proposal_id": "a1111111-1111-1111-1111-111111111111",
  "parcel_id": "c3333333-3333-3333-3333-333333333333",
  "doc_type": "SURVEY_PHOTO",
  "filename": "site_marker_photo.jpg",
  "storage_path": "uploads/d5555555-5555-5555-5555-555555555555.jpg",
  "version": 1,
  "uploaded_by": "55555555-5555-5555-5555-555555555555",
  "created_at": "2026-09-29T15:30:00.000Z"
}
```

---

#### `GET /documents/proposal/{proposalId}` — List Uploaded Evidence
Retrieves all statutory documents and surveyor photos uploaded for a project.

- **URL:** `GET /api/documents/proposal/:proposalId`
- **Auth Required:** Yes
- **Query Parameters (Optional):**
  - `doc_type`: e.g. `SURVEY_PHOTO` (filters specifically for field photos)

**Success Response (`200 OK`):**
```json
[
  {
    "id": "d5555555-5555-5555-5555-555555555555",
    "proposal_id": "a1111111-1111-1111-1111-111111111111",
    "parcel_id": "c3333333-3333-3333-3333-333333333333",
    "doc_type": "SURVEY_PHOTO",
    "filename": "site_marker_photo.jpg",
    "storage_path": "uploads/d5555555-5555-5555-5555-555555555555.jpg",
    "version": 1,
    "uploaded_by": "55555555-5555-5555-5555-555555555555",
    "uploaded_by_name": "Anita Kulkarni",
    "created_at": "2026-09-29T15:30:00.000Z"
  }
]
```

---

## 🏗️ 4. Kotlin Android Implementation Guide

### 4.1 Recommended Android Architecture
For high reliability in remote rural survey areas with flaky cellular connectivity, use the **MVI / MVVM Clean Architecture** with an **Offline-First Repository Pattern**:

```text
┌────────────────────────────────────────────────────────┐
│               Jetpack Compose UI Screen                │
│     (CameraX Preview · MapLibre Map · Checklist)       │
└───────────────────────────┬────────────────────────────┘
                            │ StateFlow / Events
                            ▼
┌────────────────────────────────────────────────────────┐
│                   FieldSurveyViewModel                 │
│         Manages GPS polling, validations, queue        │
└───────────────────────────┬────────────────────────────┘
                            │ Coroutine Dispatchers.IO
                            ▼
┌────────────────────────────────────────────────────────┐
│               SurveyRepositoryImpl                     │
│  - Fetches from Network -> Updates Room Cache          │
│  - Writes Evidence to Room Queue (SyncStatus: PENDING)  │
│  - Enqueues WorkManager CoroutineWorker                │
└─────────────┬────────────────────────────┬─────────────┘
              ▼                            ▼
  ┌───────────────────────┐    ┌───────────────────────┐
  │     Room Database     │    │  Retrofit API Client  │
  │    (Offline Cache)    │    │ (OkHttp Auth Intercept│
  └───────────────────────┘    └───────────────────────┘
```

---

### 4.2 Kotlin Data Models (DTOs)

```kotlin
package gov.vajrabhoomi.surveyor.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class AuthResponse(
    val token: String,
    val user: UserDto
)

@Serializable
data class UserDto(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
    val district: String? = null
)

@Serializable
data class ProposalDto(
    val id: String,
    @SerialName("project_name") val projectName: String,
    @SerialName("requiring_body_id") val requiringBodyId: String,
    val district: String,
    val state: String,
    @SerialName("area_hectares") val areaHectares: Double,
    val stage: String,
    val justification: String? = null,
    @SerialName("created_at") val createdAt: String
)

@Serializable
data class ParcelDto(
    val id: String,
    @SerialName("proposal_id") val proposalId: String,
    val ulpin: String? = null,
    @SerialName("owner_name") val ownerName: String? = null,
    @SerialName("claimed_area_sqm") val claimedAreaSqm: Double? = null,
    val geometry: GeoJsonPolygonDto? = null,
    @SerialName("restricted_zone_overlap") val restrictedZoneOverlap: Boolean = false,
    @SerialName("overlap_details") val overlapDetails: String? = null
)

@Serializable
data class GeoJsonPolygonDto(
    val type: String,
    val coordinates: List<List<List<Double>>> // [ [ [lon, lat], [lon, lat] ] ]
)

@Serializable
data class DocumentUploadResponse(
    val id: String,
    @SerialName("proposal_id") val proposalId: String,
    @SerialName("parcel_id") val parcelId: String? = null,
    @SerialName("doc_type") val docType: String,
    val filename: String,
    val version: Int,
    @SerialName("created_at") val createdAt: String
)
```

---

### 4.3 Retrofit API Service Interface

```kotlin
package gov.vajrabhoomi.surveyor.data.network

import gov.vajrabhoomi.surveyor.data.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface VajraBhoomiSurveyorApi {

    // Auth
    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<AuthResponse>

    @GET("auth/me")
    suspend fun getProfile(): Response<UserDto>

    // Projects
    @GET("proposals")
    suspend fun getAssignedProposals(
        @Query("district") district: String? = null,
        @Query("state") state: String? = null
    ): Response<List<ProposalDto>>

    @GET("proposals/{id}")
    suspend fun getProposalById(
        @Path("id") proposalId: String
    ): Response<ProposalDto>

    // Parcels
    @GET("parcels/proposal/{proposalId}")
    suspend fun getParcelsForProposal(
        @Path("proposalId") proposalId: String
    ): Response<List<ParcelDto>>

    // Cadastral Urban Plots
    @GET("cadastral/plots/{ulpin}")
    suspend fun getPlotByUlpin(
        @Path("ulpin") ulpin: String
    ): Response<ParcelDto>

    // Upload Geotagged Evidence Photo
    @Multipart
    @POST("documents")
    suspend fun uploadSurveyPhoto(
        @Part file: MultipartBody.Part,
        @Part("proposal_id") proposalId: RequestBody,
        @Part("doc_type") docType: RequestBody,
        @Part("parcel_id") parcelId: RequestBody? = null,
        @Part("latitude") latitude: RequestBody? = null,
        @Part("longitude") longitude: RequestBody? = null,
        @Part("accuracy_m") accuracyMeters: RequestBody? = null,
        @Part("notes") notes: RequestBody? = null
    ): Response<DocumentUploadResponse>

    // Evidence History
    @GET("documents/proposal/{proposalId}")
    suspend fun getDocumentsForProposal(
        @Path("proposalId") proposalId: String,
        @Query("doc_type") docType: String? = "SURVEY_PHOTO"
    ): Response<List<DocumentUploadResponse>>
}
```

---

### 4.4 OkHttpClient & Dynamic Auth Interceptor

```kotlin
package gov.vajrabhoomi.surveyor.data.network

import android.content.Context
import gov.vajrabhoomi.surveyor.data.storage.TokenManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import java.util.concurrent.TimeUnit

object NetworkModule {

    private const val BASE_URL = "http://10.0.2.2:4000/api/"

    fun createRetrofit(tokenManager: TokenManager): VajraBhoomiSurveyorApi {
        val authInterceptor = Interceptor { chain ->
            val requestBuilder = chain.request().newBuilder()
            tokenManager.getToken()?.let { token ->
                requestBuilder.addHeader("Authorization", "Bearer $token")
            }
            chain.proceed(requestBuilder.build())
        }

        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build()

        val json = Json {
            ignoreUnknownKeys = true
            coerceInputValues = true
            isLenient = true
        }

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(VajraBhoomiSurveyorApi::class.java)
    }
}
```

---

### 4.5 CameraX GNSS Geotagging Helper (Android)

```kotlin
package gov.vajrabhoomi.surveyor.util

import android.content.Context
import android.location.Location
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.exifinterface.media.ExifInterface
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object PhotoCaptureHelper {

    fun createOutputFile(context: Context): File {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val dir = File(context.filesDir, "survey_photos").apply { if (!exists()) mkdirs() }
        return File(dir, "SURVEY_${timestamp}.jpg")
    }

    /**
     * Stamped hardware GPS coordinates directly into the photo's JPEG EXIF tags.
     */
    fun stampExifLocation(file: File, location: Location) {
        try {
            val exif = ExifInterface(file.absolutePath)
            exif.setGpsInfo(location)
            exif.setAttribute(ExifInterface.TAG_DATETIME, SimpleDateFormat("yyyy:MM:dd HH:mm:ss", Locale.US).format(Date()))
            exif.saveAttributes()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
```

---

### 4.6 Offline Sync Worker (Android WorkManager)

```kotlin
package gov.vajrabhoomi.surveyor.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import gov.vajrabhoomi.surveyor.data.database.SurveyDatabase
import gov.vajrabhoomi.surveyor.data.network.VajraBhoomiSurveyorApi
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

class SurveySyncWorker(
    context: Context,
    workerParams: WorkerParameters,
    private val api: VajraBhoomiSurveyorApi,
    private val db: SurveyDatabase
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val pendingEvidence = db.evidenceDao().getPendingUploads()

        for (item in pendingEvidence) {
            val file = File(item.localFilePath)
            if (!file.exists()) continue

            val requestFile = file.asRequestBody("image/jpeg".toMediaTypeOrNull())
            val filePart = MultipartBody.Part.createFormData("file", file.name, requestFile)
            val proposalIdPart = item.proposalId.toRequestBody("text/plain".toMediaTypeOrNull())
            val docTypePart = "SURVEY_PHOTO".toRequestBody("text/plain".toMediaTypeOrNull())
            val parcelIdPart = item.parcelId?.toRequestBody("text/plain".toMediaTypeOrNull())
            val latPart = item.latitude.toString().toRequestBody("text/plain".toMediaTypeOrNull())
            val lonPart = item.longitude.toString().toRequestBody("text/plain".toMediaTypeOrNull())

            try {
                val response = api.uploadSurveyPhoto(
                    file = filePart,
                    proposalId = proposalIdPart,
                    docType = docTypePart,
                    parcelId = parcelIdPart,
                    latitude = latPart,
                    longitude = lonPart
                )

                if (response.isSuccessful) {
                    db.evidenceDao().markAsSynced(item.id)
                } else {
                    return Result.retry()
                }
            } catch (e: Exception) {
                return Result.retry()
            }
        }

        return Result.success()
    }
}
```

---

## 📋 5. On-Site Inspection Checklist Schema

When conducting parcel boundary verification, the mobile app records 4 statutory inspection criteria:

```json
{
  "parcel_id": "c3333333-3333-3333-3333-333333333333",
  "checklist": {
    "boundary_stones_visible": true,
    "occupant_identity_verified": true,
    "standing_assets_recorded": true,
    "encroachment_detected": false
  },
  "gnss_fix": {
    "latitude": 18.520412,
    "longitude": 73.856734,
    "altitude_m": 560.2,
    "horizontal_accuracy_m": 2.8,
    "satellite_count": 14,
    "timestamp": "2026-09-29T15:28:45Z"
  }
}
```

---

## 🧪 6. Testing & Validation Checklist

Before submitting PRs to the mobile repository, verify:

1. **Auth Login**: Successfully authenticates with `surveyor.anita@demo.gov.in` and stores token.
2. **Project List**: Renders Pune rail and logistics projects returned from `GET /api/proposals`.
3. **Map Rendering**: Correctly draws GeoJSON polygon for Parcel `MH1234567890` over OpenStreetMap tiles.
4. **GPS Accuracy Filter**: Disables capture button if GNSS accuracy > 10 meters, preventing erroneous field records.
5. **Photo Geotagging**: Successfully uploads photo via `POST /api/documents` and receives HTTP `201 Created` with a new version number.
6. **Airplane Mode Test**: 
   - Turn off Wi-Fi/Cellular on device.
   - Capture photo & check list.
   - Verify item is saved to Room DB with status `"Pending Sync"`.
   - Restore network connectivity.
   - Verify `SurveySyncWorker` automatically pushes item and marks `"Synced"`.
