export type Roles = { admin: { admin: {}} };
export const Roles = { admin: {} };

export const getRoles = (): Array<Roles> => {
  return [{
    admin: {
      admin: ''
    }
  }];
};
