import jwt from 'jsonwebtoken';

// @WithReporting()
export class JwtUtil {
  static secret = process.env.JWT_SECRET!!;

  static sign = (opts: { obj: any }) => {
    return jwt.sign({ obj: opts.obj }, this.secret);
  };

  static decode = (opts: { token: string }) => {
    try {
      return (jwt.verify(opts.token, this.secret) as any).obj;
    } catch {
      return null;
    }
  };
}
