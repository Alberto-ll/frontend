import { BrowserRouter, Routes, Route } from 'react-router'
import '../../static/css/App.css'
import {AdminLayout} from '../../layout/AdminLayout.tsx';
import LocalityHome from '../adminPages/localityPages/localityHome.tsx';
import AdminDashboard from '../adminPages/adminDashboard.tsx';
import CouponHome from '../adminPages/couponPages/couponHome.tsx';
import CouponGetAll from '../adminPages/couponPages/couponGetAll.tsx';
import CouponGetOne from '../adminPages/couponPages/couponGetOne.tsx';
import CouponAdd from '../adminPages/couponPages/couponAdd.tsx';
import CouponUpdate from '../adminPages/couponPages/couponUpdate.tsx';
import PitchHome from '../adminPages/pitchPages/pitchHome.tsx';
import PitchGetAll from '../adminPages/pitchPages/pitchGetAll.tsx';
import PitchGetOne from '../adminPages/pitchPages/pitchGetOne.tsx';
import PitchAdd from '../adminPages/pitchPages/pitchAdd.tsx';
import PitchUpdate from '../adminPages/pitchPages/pitchUpdate.tsx';
import { LoginPage } from '../loginPage.tsx';
import UserHome from '../adminPages/userPages/userHome.tsx';
import CategoryHome from '../adminPages/categoryPages/categoryHome.tsx';
import Homepage from "../homepage/homepage.tsx";
import AboutUs from '../homepage/aboutUs.tsx';
import UserGetAll from '../adminPages/userPages/usersGetAll.tsx';
import UserDetail from '../adminPages/userPages/userDetail.tsx';
import UserUpdate from '../adminPages/userPages/userUpdate.tsx';
import { HomeLayout } from '../../layout/HomeLayout.tsx';
import UserCreate from '../adminPages/userPages/userCreate.tsx';
import CategoryGetAll from '../adminPages/categoryPages/categoryGetAll.tsx';
import CategoryCreate from '../adminPages/categoryPages/categoryCreate.tsx';
import CategoryDetail from '../adminPages/categoryPages/categoryDetail.tsx';
import CategoryUpdate from '../adminPages/categoryPages/categoryUpdate.tsx';
import LocalitiesGetAll from '../adminPages/localityPages/localityGetAll.tsx';
import LocalityDetail from '../adminPages/localityPages/localityDetail.tsx';
import LocalityUpdate from '../adminPages/localityPages/localityUpdate.tsx';
import LocalityCreate from '../adminPages/localityPages/localityCreate.tsx';
import BusinessHome from '../adminPages/business/businessHome.tsx';
import BusinessGetAll from '../adminPages/business/businessGetAll.tsx';

import CourtsPage from '../reservationPage/CourtsPage.tsx';
import { RegisterBusinessPage } from '../registerBusiness.tsx';
import InactiveBusinesses from '../adminPages/inactiveBusinesses/inactiveBusinesses.tsx';
import BusinessCreate from '../adminPages/business/businessCreate.tsx';
import BusinessUpdate from '../adminPages/business/businessUpdate.tsx';
import BusinessDetail from '../adminPages/business/businessDetail.tsx';
import BusinessPitchDetail from '../businessManagment/detail.tsx';
import ReservePitchPage from '../ReservePitch.tsx';
import MyReservations from '../homepage/myReservations.tsx';
import BusinessPitchHome from '../businessManagment/home.tsx';
import BusinessPitchAdd from '../businessManagment/add.tsx';
import BusinessPitchEdit from '../businessManagment/edit.tsx';
import BusinessPitchGetAll from '../businessManagment/getAll.tsx';
import BusinessReservations from '../businessManagment/getReservations.tsx';
import ReservePitchPageMakeReservation from '../reservationPage/reservationPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route index path='/' element={<Homepage/>}/>
          <Route path='login/' element={<LoginPage/>}/>
          <Route path='makeReservation/:id' element={<ReservePitchPageMakeReservation/>} />
          <Route path='about/' element={<AboutUs/>}/>
          <Route path='registerBusiness/' element={<RegisterBusinessPage/>}/>
          <Route path='reservation/' element={<CourtsPage/>}/>
          <Route path='reserve-pitch/' element={<ReservePitchPage/>}/>
          <Route path='myReservations/' element={<MyReservations/>}/>
          <Route path='myBusiness/' element={<BusinessPitchHome />}>
            <Route path='getAll/' element={<BusinessPitchGetAll />} />
            <Route path='add/' element={<BusinessPitchAdd />} />
            <Route path='edit/:id' element={<BusinessPitchEdit />} />
            <Route path='detail/:id' element={<BusinessPitchDetail />} />
            <Route path='getReservations/' element={<BusinessReservations />} />
          </Route>
        </Route>

        <Route path="admin/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="coupons/" element={<CouponHome />}>
            <Route path="getAll/" element={<CouponGetAll />}/>
            <Route path='getOne/' element={<CouponGetOne />}/>
            <Route path='add/' element={<CouponAdd />}/>
            <Route path='update/' element={<CouponUpdate />}/>
          </Route>


          <Route path="pitchs/" element={<PitchHome />}>
            <Route path="getAll/" element={<PitchGetAll />}/>
            <Route path='getOne/' element={<PitchGetOne />}/>
            <Route path='getOne/:id' element={<PitchGetOne />}/>
            <Route path='add/' element={<PitchAdd />}/>
            <Route path='update/' element={<PitchUpdate />}/>
            <Route path='update/:id' element={<PitchUpdate />}/>
          </Route>

          <Route path="business/" element={<BusinessHome />}>
            <Route path="getAll/" element={<BusinessGetAll />}/>
            <Route path='create/' element={<BusinessCreate />}/>
            {/*<Route path='add/' element={<BusinessAdd />}/> */}
            <Route path='update/:id' element={<BusinessUpdate />}/>
            <Route path='detail/:id' element={<BusinessDetail />}/>
            <Route path="inactiveBusinesses/" element={<InactiveBusinesses />} />

          </Route>

          <Route path="localities/" element={<LocalityHome />} >
            <Route path="getAll/" element={<LocalitiesGetAll />} />
            <Route path="create/" element={<LocalityCreate />} />
            <Route path="getOne/:id" element={<LocalityDetail />} />
            <Route path="update/:id" element={<LocalityUpdate />} />
            <Route path="remove/:id" element={<LocalityHome />} />
          </Route>

          <Route path="categories/" element={<CategoryHome />} >
            <Route path="getAll/" element={<CategoryGetAll />} />
            <Route path="create/" element={<CategoryCreate />} />
            <Route path="detail/:id" element={<CategoryDetail />} />
            <Route path="update/:id" element={<CategoryUpdate />} />
          </Route>
          <Route path="users/" element={<UserHome />}>
            <Route path="getAll/" element={<UserGetAll />} />
            <Route path="detail/:id" element={<UserDetail />} />
            <Route path="update/:id" element={<UserUpdate />} />
            <Route path="createUser/" element={<UserCreate />} />
          </Route>
        </Route>
      </Routes>
  </BrowserRouter>
  )
}

export default App
