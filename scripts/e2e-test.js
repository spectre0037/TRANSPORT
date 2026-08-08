const BASE = process.env.API_URL || 'http://localhost:3001';

const ADMIN = { email: 'xpresstaleem@gmail.com', password: 'AdminPassword123!' };
const STUDENT = { email: 'student@giki.edu.pk', password: 'StudentPassword123!' };

let adminToken, studentToken, adminRefresh, studentRefresh, studentUserId;
let departureId, seatIdMale, seatIdFemale, bookingId, refundId;
const results = [];

const log = (test, ok, detail = '') => {
  const status = ok ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${status} ${test}${detail ? ' - ' + detail : ''}`);
  results.push({ test, ok });
};

async function api(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const resp = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await resp.json().catch(() => ({}));
  return { status: resp.status, data };
}

async function run() {
  console.log('\n🧪 TaleemXpress E2E Test Suite v2\n');
  console.log('='.repeat(50));

  // 1. Health
  console.log('\n📡 Health Check');
  {
    const { status, data } = await api('GET', '/api/health');
    log('GET /api/health', status === 200 && data.status === 'ok', `status: ${status}`);
  }

  // 2. Auth
  console.log('\n🔐 Authentication');
  {
    const { status } = await api('POST', '/api/auth/register', ADMIN);
    log('Admin register (exists check)', status === 201 || status === 400, `status: ${status}`);
  }
  {
    const { status, data } = await api('POST', '/api/auth/login', ADMIN);
    log('Admin login', status === 200 && !!data.accessToken, `status: ${status}`);
    if (data.accessToken) { adminToken = data.accessToken; adminRefresh = data.refreshToken; }
  }
  {
    const { status, data } = await api('POST', '/api/auth/login', STUDENT);
    log('Student login', status === 200 && !!data.accessToken, `status: ${status}`);
    if (data.accessToken) { studentToken = data.accessToken; studentRefresh = data.refreshToken; }
  }
  {
    const { status } = await api('POST', '/api/auth/login', { ...STUDENT, password: 'wrong' });
    log('Wrong password rejected', status === 401, `status: ${status}`);
  }
  {
    const { status, data } = await api('POST', '/api/auth/refresh', { refreshToken: adminRefresh });
    log('Token refresh', status === 200 && !!data.accessToken, `status: ${status}`);
    if (data.accessToken) adminToken = data.accessToken;
  }

  // 3. User profile
  console.log('\n👤 User Profile');
  {
    const { status, data } = await api('GET', '/api/users/me', null, adminToken);
    log('GET /users/me (admin)', status === 200 && data.role === 'admin', `role: ${data.role}`);
  }
  {
    const { status, data } = await api('GET', '/api/users/me', null, studentToken);
    log('GET /users/me (student)', status === 200 && data.role === 'student', `role: ${data.role}`);
    if (data.id) studentUserId = data.id;
  }
  {
    const { status } = await api('GET', '/api/users/me');
    log('Unauthorized access rejected', status === 401, `status: ${status}`);
  }

  // 4. Departures — Create + list
  console.log('\n🚌 Departures (4-Column Layout)');
  {
    const { status, data } = await api('POST', '/api/departures', {
      route: 'GIKI → Islamabad',
      fromCity: 'Swabi',
      toCity: 'Islamabad',
      departureDate: '2026-08-15',
      departureTime: '08:00',
      totalSeats: 45,
      pricePerSeat: 850,
      busType: 'AC',
    }, adminToken);
    log('Create departure (admin)', status === 201 && !!data.id, `id: ${data.id?.slice(0,8)}...`);
    departureId = data.id;
  }
  {
    const { status } = await api('POST', '/api/departures', {
      route: 'Test', fromCity: 'A', toCity: 'B',
      departureDate: '2026-08-20', departureTime: '10:00', pricePerSeat: 500,
    }, studentToken);
    log('Student cannot create departure', status === 403, `status: ${status}`);
  }
  {
    const { status, data } = await api('GET', '/api/departures');
    log('List departures (public)', status === 200 && Array.isArray(data), `count: ${data.length}`);
  }

  // 5. Verify 4-column seat layout
  {
    const { status, data } = await api('GET', `/api/departures/${departureId}`);
    log('Get departure + seats', status === 200 && !!data.seats, `seats: ${data.seats?.length}`);

    // Verify 4-column layout: rows should have max 4 seats, row L has 1 seat
    if (data.seats) {
      const rowCounts = {};
      data.seats.forEach(s => { rowCounts[s.row] = (rowCounts[s.row] || 0) + 1; });
      const hasRowLWith1 = rowCounts['L'] === 1;
      const hasRowAWith4 = rowCounts['A'] === 4;
      log('4-column layout (rows A-K=4, L=1)', hasRowAWith4 && hasRowLWith1, `row counts: ${JSON.stringify(rowCounts)}`);

      // Pick one male and one female seat
      seatIdMale = data.seats.find(s => !s.isBooked && s.row === 'A' && s.column === 1)?.id;
      seatIdFemale = data.seats.find(s => !s.isBooked && s.row === 'A' && s.column === 3)?.id;
    }
  }

  // 6. Bookings with gender + payment methods
  console.log('\n🎫 Bookings (with Gender + Payment)');
  {
    // First, add wallet balance for wallet payment test
    await api('POST', `/api/users/${studentUserId}/wallet-adjust`, { amount: 2000, description: 'Test balance' }, adminToken);
    const { status, data } = await api('POST', '/api/bookings', {
      departureId, seatId: seatIdMale, gender: 'male', paymentMethod: 'wallet',
    }, studentToken);
    log('Create booking (male) - wallet payment', status === 201 && data.status === 'approved', `ref: ${data.bookingReference}, status: ${data.status}`);
    bookingId = data.id;
  }
  {
    const { status, data } = await api('POST', '/api/bookings', {
      departureId, seatId: seatIdFemale, gender: 'female', paymentMethod: 'upload',
    }, studentToken);
    log('Create booking (female) - upload payment', status === 201 && data.status === 'pending_approval', `ref: ${data.bookingReference}, status: ${data.status}`);
  }
  {
    const { status, data } = await api('POST', '/api/bookings', {
      departureId, seatId: seatIdMale, gender: 'male',
    }, studentToken);
    log('Cannot book already booked seat', status === 400, `status: ${status}`);
  }
  {
    const { status, data } = await api('POST', '/api/bookings', {
      departureId, seatId: null, gender: 'male',
    }, studentToken);
    log('Reject booking without seatId', status === 400 || status === 404, `status: ${status}`);
  }
  {
    const { status, data } = await api('POST', '/api/bookings', {
      departureId: departureId, seatId: seatIdMale, gender: 'invalid',
    }, studentToken);
    log('Reject invalid gender', status === 400, `status: ${status}`);
  }
  {
    const { status, data } = await api('GET', '/api/bookings/my', null, studentToken);
    log('Get my bookings (has gender)', status === 200 && data.length >= 2 && !!data[0].gender, `count: ${data.length}, hasGender: ${!!data[0]?.gender}`);
  }

  // 7. Admin approve booking
  {
    const { status } = await api('PUT', `/api/bookings/${bookingId}/status`, {
      status: 'approved', paymentStatus: 'verified', notes: 'Payment verified',
    }, adminToken);
    log('Admin approve booking', status === 200, `status: ${status}`);
  }

  // 8. Departure status changes
  console.log('\n🚦 Departure Status Changes');
  {
    const { status, data } = await api('PUT', `/api/departures/${departureId}`, { status: 'valid' }, adminToken);
    log('Set departure to valid', status === 200 && data.status === 'valid', `status: ${data.status}`);
  }
  {
    const { status, data } = await api('PUT', `/api/departures/${departureId}`, { status: 'confirmed' }, adminToken);
    log('Set departure to confirmed', status === 200 && data.status === 'confirmed', `status: ${data.status}`);
  }
  {
    const { status, data } = await api('PUT', `/api/departures/${departureId}`, { status: 'dropped' }, adminToken);
    log('Set departure to dropped', status === 200 && data.status === 'dropped', `status: ${data.status}`);
  }

  // 9. Wallet
  console.log('\n💰 Wallet');
  {
    const { status, data } = await api('GET', '/api/wallet/balance', null, studentToken);
    log('Get wallet balance', status === 200 && typeof data.balance === 'number', `balance: ${data.balance}`);
  }
  {
    const { status, data } = await api('GET', '/api/wallet/transactions', null, studentToken);
    log('Get wallet transactions', status === 200 && Array.isArray(data), `count: ${data.length}`);
  }

  // 10. Refund requests
  console.log('\n💸 Refund Requests');
  {
    const { status, data } = await api('GET', '/api/refunds/my', null, studentToken);
    log('Get my refunds', status === 200, `status: ${status}`);
  }
  {
    const { status, data } = await api('POST', '/api/refunds', { bookingId, reason: 'Changed plans' }, studentToken);
    log('Request refund', status === 201 || status === 400, `status: ${status}`);
    refundId = data.id;
  }
  {
    if (refundId) {
      const { status } = await api('PUT', `/api/refunds/${refundId}/process`, { status: 'approved', adminNotes: 'Refunded' }, adminToken);
      log('Admin process refund', status === 200, `status: ${status}`);
    }
  }
  {
    const { status, data } = await api('GET', '/api/refunds', null, adminToken);
    log('Get all refunds (admin)', status === 200 && Array.isArray(data), `count: ${data.length}`);
  }

  // 11. Analytics
  console.log('\n📊 Analytics');
  {
    const { status, data } = await api('GET', '/api/analytics/dashboard', null, adminToken);
    log('Admin dashboard analytics', status === 200 && !!data.stats, `users: ${data.stats?.totalUsers}`);
  }
  {
    const { status } = await api('GET', '/api/analytics/dashboard', null, studentToken);
    log('Student cannot access analytics', status === 403, `status: ${status}`);
  }

  // 12. Uploads
  console.log('\n📤 Uploads');
  {
    const { status, data } = await api('GET', '/api/uploads/signed-url', null, studentToken);
    log('Get signed upload URL', status === 200 && !!data.url, `url ok: ${!!data.url}`);
  }

  // 13. Admin user management
  console.log('\n🔧 Admin User Management');
  {
    const { status, data } = await api('GET', '/api/users', null, adminToken);
    log('Admin list users', status === 200 && data.length >= 2, `count: ${data.length}`);
  }
  {
    const { status } = await api('GET', '/api/users', null, studentToken);
    log('Student cannot list users', status === 403, `status: ${status}`);
  }

  // 14. Cancel booking
  console.log('\n🚫 Cancel Booking');
  {
    const { status } = await api('POST', `/api/bookings/${bookingId}/cancel`, null, studentToken);
    log('Cancel booking', status === 200, `status: ${status}`);
  }
  {
    const { status } = await api('POST', `/api/bookings/${bookingId}/cancel`, null, studentToken);
    log('Cannot cancel already cancelled booking', status === 400, `status: ${status}`);
  }

  // 15. Logout
  console.log('\n👋 Logout');
  {
    const { status } = await api('POST', '/api/auth/logout', { refreshToken: studentRefresh }, studentToken);
    log('Logout', status === 200, `status: ${status}`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${results.length} total`);
  console.log(failed === 0 ? '\n🎉 All tests passed!' : '\n⚠️ Some tests failed.');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => { console.error('❌ E2E test error:', err); process.exit(1); });
