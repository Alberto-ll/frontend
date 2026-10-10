import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import "../../static/css/App.css";
import { AdminLayout } from "../../layout/AdminLayout";
import LocalityHome from "../adminPages/localityPages/LocalityHome";
import AdminDashboard from "../adminPages/AdminDashboard";
import CouponHome from "../adminPages/couponPages/CouponHome";
import CouponGetAll from "../adminPages/couponPages/CouponGetAll";
import CouponGetOne from "../adminPages/couponPages/CouponGetOne";
import CouponAdd from "../adminPages/couponPages/CouponAdd";
import CouponUpdate from "../adminPages/couponPages/CouponUpdate";
import PitchHome from "../adminPages/pitchPages/PitchHome";
import PitchGetAll from "../adminPages/pitchPages/PitchGetAll";
import PitchGetOne from "../adminPages/pitchPages/PitchGetOne";
import PitchAdd from "../adminPages/pitchPages/PitchAdd";
import PitchUpdate from "../adminPages/pitchPages/PitchUpdate";
import { LoginPage } from "../LoginPage";
import UserHome from "../adminPages/userPages/UserHome";
import CategoryHome from "../adminPages/categoryPages/CategoryHome";
import Homepage from "../homepage/Homepage";
import AboutUs from "../homepage/AboutUs";
import UserGetAll from "../adminPages/userPages/UserGetAll";
import UserDetail from "../adminPages/userPages/UserDetail";
import UserUpdate from "../adminPages/userPages/UserUpdate";
import { HomeLayout } from "../../layout/HomeLayout";
import UserCreate from "../adminPages/userPages/UserCreate";
import CategoryGetAll from "../adminPages/categoryPages/CategoryGetAll";
import CategoryCreate from "../adminPages/categoryPages/CategoryCreate";
import CategoryDetail from "../adminPages/categoryPages/CategoryDetail";
import CategoryUpdate from "../adminPages/categoryPages/CategoryUpdate";
import LocalitiesGetAll from "../adminPages/localityPages/LocalityGetAll";
import LocalityDetail from "../adminPages/localityPages/LocalityDetail";
import LocalityUpdate from "../adminPages/localityPages/LocalityUpdate";
import LocalityCreate from "../adminPages/localityPages/LocalityCreate";
import BusinessHome from "../adminPages/business/BusinessHome";
import BusinessGetAll from "../adminPages/business/BusinessGetAll";
import { RegisterBusinessPage } from "../RegisterBusinessPage";
import InactiveBusinesses from "../adminPages/inactiveBusinesses/InactiveBusinesses";
import BusinessCreate from "../adminPages/business/BusinessCreate";
import BusinessUpdate from "../adminPages/business/BusinessUpdate";
import BusinessDetail from "../adminPages/business/BusinessDetail";
import BusinessPitchDetail from "../businessManagement/BusinessPitchDetail";
import ReservePitchPage from "../ReservePitch";
import MyReservations from "../homepage/MyReservations";
import BusinessPitchHome from "../businessManagement/BusinessHome";
import BusinessPitchAdd from "../businessManagement/BusinessPitchAdd";
import BusinessPitchEdit from "../businessManagement/BusinessPitchEdit";
import BusinessPitchList from "../businessManagement/BusinessPitchList";
import BusinessEdit from "../businessManagement/BusinessEdit";
import BusinessReservations from "../businessManagement/BusinessReservations";
import ReservePitchPageMakeReservation from "../reservationPage/ReservationPage";
import ProtectedRoute from "../../components/ProtectedRoute";
import NotFound from "../../components/NotFound";
import BusinessListPage from "../businessList/BusinessListPage";
import BusinessDetailPage from "../businessList/BusinessDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route index path="/" element={<Homepage />} />
          <Route path="login" element={<LoginPage />} />
          <Route
            path="makeReservation/:id"
            element={
              <ProtectedRoute>
                <ReservePitchPageMakeReservation />
              </ProtectedRoute>
            }
          />
          <Route path="about" element={<AboutUs />} />
          <Route
            path="registerBusiness"
            element={
              <ProtectedRoute>
                <RegisterBusinessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reservation"
            element={<Navigate to="/reserve-pitch" replace />}
          />
          <Route
            path="reserve-pitch"
            element={
              <ProtectedRoute>
                <ReservePitchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="businesses"
            element={
              <ProtectedRoute>
                <BusinessListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="businesses/:id"
            element={
              <ProtectedRoute>
                <BusinessDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="myReservations"
            element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            }
          />

          {/* Propietario de Negocio */}
          <Route
            path="myBusiness"
            element={
              <ProtectedRoute requiredRoles={["business_owner", "admin"]}>
                <BusinessPitchHome />
              </ProtectedRoute>
            }
          >
            <Route path="getAll" element={<BusinessPitchList />} />
            <Route path="add" element={<BusinessPitchAdd />} />
            <Route path="edit/:id" element={<BusinessPitchEdit />} />
            <Route path="detail/:id" element={<BusinessPitchDetail />} />
            <Route path="getReservations" element={<BusinessReservations />} />
            <Route path="editBusiness" element={<BusinessEdit />} />
          </Route>

          {/* Admin routes — inside HomeLayout so auth messages get header + footer */}
          <Route
            path="admin"
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />

            <Route path="coupons" element={<CouponHome />}>
              <Route path="getAll" element={<CouponGetAll />} />
              <Route path="create" element={<CouponAdd />} />
              <Route path="add" element={<CouponAdd />} />
              <Route path="getOne" element={<CouponGetOne />} />
              <Route path="detail/:id" element={<CouponGetOne />} />
              <Route path="update" element={<CouponUpdate />} />
              <Route path="update/:id" element={<CouponUpdate />} />
            </Route>

            <Route path="pitches" element={<PitchHome />}>
              <Route path="getAll" element={<PitchGetAll />} />
              <Route path="create" element={<PitchAdd />} />
              <Route path="add" element={<PitchAdd />} />
              <Route path="getOne" element={<PitchGetOne />} />
              <Route path="getOne/:id" element={<PitchGetOne />} />
              <Route path="detail/:id" element={<PitchGetOne />} />
              <Route path="update" element={<PitchUpdate />} />
              <Route path="update/:id" element={<PitchUpdate />} />
            </Route>

            {/* Redirección / alias para URLs legadas con pitchs */}
            <Route
              path="pitchs/*"
              element={<Navigate to="/admin/pitches" replace />}
            />

            <Route path="business" element={<BusinessHome />}>
              <Route path="getAll" element={<BusinessGetAll />} />
              <Route path="create" element={<BusinessCreate />} />
              <Route path="detail/:id" element={<BusinessDetail />} />
              <Route path="update/:id" element={<BusinessUpdate />} />
              <Route
                path="inactiveBusinesses"
                element={<InactiveBusinesses />}
              />
            </Route>

            <Route path="localities" element={<LocalityHome />}>
              <Route path="getAll" element={<LocalitiesGetAll />} />
              <Route path="create" element={<LocalityCreate />} />
              <Route path="detail/:id" element={<LocalityDetail />} />
              <Route path="getOne/:id" element={<LocalityDetail />} />
              <Route path="update/:id" element={<LocalityUpdate />} />
              <Route path="remove/:id" element={<LocalityHome />} />
            </Route>

            <Route path="categories" element={<CategoryHome />}>
              <Route path="getAll" element={<CategoryGetAll />} />
              <Route path="create" element={<CategoryCreate />} />
              <Route path="detail/:id" element={<CategoryDetail />} />
              <Route path="update/:id" element={<CategoryUpdate />} />
            </Route>

            <Route path="users" element={<UserHome />}>
              <Route path="getAll" element={<UserGetAll />} />
              <Route path="create" element={<UserCreate />} />
              <Route path="createUser" element={<UserCreate />} />
              <Route path="detail/:id" element={<UserDetail />} />
              <Route path="update/:id" element={<UserUpdate />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
