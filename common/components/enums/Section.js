const Section = {
  AboutProject: 'AboutProject',
  AboutUs: 'AboutUs',
  CreateProject: 'CreateProject',
  EditProject: 'EditProject',
  Landing: 'Landing',
  FindProjects: 'FindProjects',
  MyProjects: 'MyProjects',
  Profile: 'Profile',
  Inbox: 'Inbox',
  SignUp: 'SignUp',
  LogIn: 'LogIn',
  ResetPassword: 'ResetPassword',
  ChangePassword: 'ChangePassword',
  EditProfile: 'EditProfile',
  SignedUp: 'SignedUp',
  EmailVerified: 'EmailVerified',
  PartnerWithUs: 'PartnerWithUs'
};

export type SectionType = $Keys<typeof Section>;

export default Section;
