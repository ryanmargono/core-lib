import { OAuth2Client } from 'google-auth-library';

// @WithReporting('GoogleAuthService')
export class GoogleAuthService {
  client: OAuth2Client;

  constructor(public opts: { clientId: string }) {
    this.client = new OAuth2Client(opts.clientId);
  }

  async verifyIdToken(token: string): Promise<string | undefined> {
    const res = await this.client.getTokenInfo(token);
    return res.email;
  }
}
