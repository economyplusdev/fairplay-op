const { live, xbl } = require('@xboxreplay/xboxlive-auth');


const clientID = process.env.XBOXCLIENTID;
const redirect = process.env.XBOXREDIRECT;
const secret = process.env.XBOXSECRET;


async function translateXboxAuthentication(xblQueryCode) {
    const exchangeCodeResponse = await live.exchangeCodeForAccessToken(xblQueryCode, clientID, 'XboxLive.signin XboxLive.offline_access', redirect, secret);
    const rpsTicket = exchangeCodeResponse?.access_token;
    const refreshToken = exchangeCodeResponse?.refresh_token;
    const userTokenResponse = await xbl.exchangeRpsTicketForUserToken(
        rpsTicket,
        'd'
    );
    const XSTSTokenResponse = await xbl.exchangeTokenForXSTSToken(
        userTokenResponse.Token
    );
    const hasExpired = new Date() >= new Date(XSTSTokenResponse.NotAfter);
    if (hasExpired == false && refreshToken !== undefined) {
        const temptoken = userTokenResponse.Token
        const XSTSTokenResponse = await xbl.exchangeTokenForXSTSToken(temptoken, {
            XSTSRelyingParty: 'http://xboxlive.com',
        });
        const realmtokenresponse = await xbl.exchangeTokenForXSTSToken(temptoken, {
            XSTSRelyingParty: 'https://pocket.realms.minecraft.net/',
        });
        const username = XSTSTokenResponse.DisplayClaims.xui[0].gtg
        const xuid = XSTSTokenResponse.DisplayClaims.xui[0].xid

        const uhs2 = realmtokenresponse.DisplayClaims.xui[0].uhs
        const xts2 = realmtokenresponse.Token
        const realmToken = `XBL3.0 x=${uhs2};${xts2}`
        const realmExpire = realmtokenresponse.NotAfter

        const uhs = XSTSTokenResponse.DisplayClaims.xui[0].uhs
        const xts = XSTSTokenResponse.Token
        const xbltoken = `XBL3.0 x=${uhs};${xts}`
        const xblExpire = XSTSTokenResponse.NotAfter

        return {
            userData: {
                username: username,
                xuid: xuid,
            },
            xboxSessionToken: exchangeCodeResponse,
        }
    } else {
        return {
            error: "Token has expired"
        }
    }

}

module.exports = translateXboxAuthentication;