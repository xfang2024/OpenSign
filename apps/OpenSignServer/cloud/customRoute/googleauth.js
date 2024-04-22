import axios from 'axios';
const appId = process.env.APP_ID;
const serverUrl = process.env.SERVER_URL;
export default async function gooogleauth(request, response) {
  const code = request.body.code;
  const baseUrl = new URL(process.env.SERVER_URL);
  //   const sessiontoken = request.headers;
  //   console.log('sessiontoken', sessiontoken);
  //   console.log('google code', code);
  try {
    const userRes = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': request.headers['sessiontoken'],
      },
    });
    const userId = userRes.data && userRes.data.objectId;
    if (userId) {
      const clientId = process.env.GOOGLE_CLIENT_ID; // '918704711393-thhv3re2pfqvve76tgb86ulu1tlpssrk.apps.googleusercontent.com';
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET; //'3NqyXVNm4jUhwNE4D8eVosII';
      const redirectUri = baseUrl.origin || 'http://localhost:3000'; // Should match the redirect URI used in the authorization request
      const tokenEndpoint = 'https://oauth2.googleapis.com/token';

      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('redirect_uri', redirectUri);
      params.append('grant_type', 'authorization_code');

      const res = await axios.post(tokenEndpoint, params);
      //   console.log('oauthres ', res.data);
      const refresh_token = res.data.refresh_token;
      const extUserCls = new Parse.Query('contracts_Users');
      extUserCls.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
      const extUser = await extUserCls.first({ useMasterKey: true });

      if (extUser) {
        const extUserCls = new Parse.Object('contracts_Users');
        extUserCls.id = extUser.id;
        extUserCls.set('google_refresh_token', refresh_token);
        const updateExtUser = await extUserCls.save(null, { useMasterKey: true });
        // console.log('updateExtUser ', updateExtUser);
      }
      return response.status(200).json({ status: 'success!' });
    } else {
      return response.status(404).json({ message: 'user not found!' });
    }
  } catch (err) {
    console.log('err in google auth', err.message);
    return response.status(404).json({ message: err.message });
  }
}