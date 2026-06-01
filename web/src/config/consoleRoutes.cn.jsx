/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import Loading from '../components/common/ui/Loading';
import User from '../pages/User';
import { AdminRoute, PrivateRoute } from '../helpers';
import Token from '../pages/Token';
import TopUp from '../pages/TopUp';
import Log from '../pages/Log';
import PersonalSetting from '../components/settings/PersonalSetting';
import SecuritySetting from '../components/settings/SecuritySetting';
import Contract from '../pages/Contract';

const Dashboard = lazy(() => import('../pages/Dashboard'));

export function getConsoleRouteElements(location) {
  return (
    <>
      <Route
        path='/console/token'
        element={
          <PrivateRoute>
            <Token />
          </PrivateRoute>
        }
      />
      <Route
        path='/console/user'
        element={
          <AdminRoute>
            <User />
          </AdminRoute>
        }
      />
      <Route
        path='/console/personal'
        element={
          <PrivateRoute>
            <Suspense fallback={<Loading />} key={location.pathname}>
              <PersonalSetting />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path='/console/security'
        element={
          <PrivateRoute>
            <Suspense fallback={<Loading />} key={location.pathname}>
              <SecuritySetting />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path='/console/contract'
        element={
          <PrivateRoute>
            <Suspense fallback={<Loading />} key={location.pathname}>
              <Contract />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path='/console/topup'
        element={
          <PrivateRoute>
            <Suspense fallback={<Loading />} key={location.pathname}>
              <TopUp />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path='/console/log'
        element={
          <PrivateRoute>
            <Log />
          </PrivateRoute>
        }
      />
      <Route
        path='/console'
        element={
          <PrivateRoute>
            <Suspense fallback={<Loading />} key={location.pathname}>
              <Dashboard />
            </Suspense>
          </PrivateRoute>
        }
      />
    </>
  );
}
