/**
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                        *
 *                                                                                                 *
 *  Licensed under the Amazon Software License (the "License"). You may not use this               *
 *  file except in compliance with the License. A copy of the License is located at                *
 *                                                                                                 *
 *      http://aws.amazon.com/asl/                                                                 *
 *                                                                                                 *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS"        *
 *  BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License       *
 *  for the specific language governing permissions and limitations under the License.             *
 *
 */

/**
 * @author MediaEnt Solutions
 */

/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

/**
 * @class SignInModal
 * @description handle authentication ui flow, sign in/out modal and new password modal
 */
class SignInModal {
  constructor(params = {}) {
    const {
      cognitoInstance = undefined,
      onSignInHandler = undefined,
      onSignOutHandler = undefined,
      signinBtn = '#signinBtn',
      signoutBtn = '#signoutBtn',
      modalSignin = '#modalSignin',
      modelNewPassword = '#modalNewPassword',
    } = params;

    this.$cognitoInstance = cognitoInstance;
    this.$onSignInHandler = onSignInHandler;
    this.$onSignOutHandler = onSignOutHandler;
    this.$signinBtn = $(signinBtn);
    this.$signoutBtn = $(signoutBtn);
    this.$signinModal = $(modalSignin);
    this.$newPasswordModal = $(modelNewPassword);

    this.domInit();

    this.domNewPasswordInit();
  }

  get cognito() {
    return this.$cognitoInstance;
  }

  set cognito(val) {
    this.$cognitoInstance = val;
  }

  get onSignInHandler() {
    return this.$onSignInHandler;
  }

  get onSignOutHandler() {
    return this.$onSignOutHandler;
  }


  get signinBtn() {
    return this.$signinBtn;
  }

  get signoutBtn() {
    return this.$signoutBtn;
  }

  get signinModal() {
    return this.$signinModal;
  }

  get newPasswordModal() {
    return this.$newPasswordModal;
  }

  get signinForm() {
    return this.$signinForm;
  }

  get inputUsername() {
    return this.$inputUsername;
  }

  get inputPassword() {
    return this.$inputPassword;
  }

  get alertMessage() {
    return this.$alertMessage;
  }

  /**
   * @function domInit
   * @description initialize sign in modal
   */
  async domInit() {
    const signinForm = 'cognitoSigninForm';
    const usernameField = 'inputUsername';
    const passwordField = 'inputPassword';
    const alertField = 'alertMessage';

    const element = $(`
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Cognito</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form id="${signinForm}">
            <div class="form-group">
              <label for="${usernameField}">Username</label>
              <input type="text" class="form-control" id="${usernameField}" aria-describedby="usernameHelp" placeholder="Enter username">
              <small class="form-text text-muted">You can also enter your email address.</small>
            </div>
            <div class="form-group">
              <label for="${passwordField}">Password</label>
              <input type="password" class="form-control" id="${passwordField}" placeholder="Password">
            </div>
            <button type="submit" class="btn btn-secondary">Sign in</button>
            <div class="form-group">
              <span id="${alertField}" class="collapse text-danger">Alert message...</span>
            </div>
          </form>
        </div>
      </div>
    </div>`);

    element.appendTo(this.signinModal);

    this.$signinForm = $(`#${signinForm}`);
    this.$inputUsername = $(`#${usernameField}`, this.$signinForm);
    this.$inputPassword = $(`#${passwordField}`, this.$signinForm);
    this.$alertMessage = $(`#${alertField}`, this.$signinForm);

    this.registerEvents();
  }

  /**
   * @function domNewPasswordInit
   * @description initialize new password modal ui
   */
  async domNewPasswordInit() {
    const formId = 'newPasswordForm';
    const newPasswordId = 'newPasswordId';
    const retypePasswordId = 'retypePasswordId';
    const alertId = 'alertId';

    const element = $(`
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">New Password Required</h5>
        </div>
        <div class="modal-body">
          <form id="${formId}">
            <div class="form-group">
              <label for="${newPasswordId}">New Password</label>
              <input type="password" class="form-control" id="${newPasswordId}" placeholder="Password">
            </div>
            <div class="form-group">
              <label for="${retypePasswordId}">Re-type password</label>
              <input type="password" class="form-control" id="${retypePasswordId}" placeholder="Password">
            </div>
            <div class="form-group">
              <small>Must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character</small>
            </div>
            <button type="submit" class="btn btn-secondary">Update</button>
            <div class="form-group">
              <span id="${alertId}" class="collapse text-danger">Alert message...</span>
            </div>
          </form>
        </div>
      </div>
    </div>`);

    element.appendTo(this.newPasswordModal);

    const form = $(`#${formId}`, this.newPasswordModal);
    const password01 = $(`#${newPasswordId}`, form);
    const password02 = $(`#${retypePasswordId}`, form);
    const alertMessage = $(`#${alertId}`, form);

    /* password form submit event */
    form.submit(async (event) => {
      try {
        event.preventDefault();
        if (password01.val() !== password02.val()) {
          alertMessage.html('<small>passwords do not match. Please re-enter.</small>').collapse('show');
        } else if (!password01.val().match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
          alertMessage.html('<small>password does not meet criteria. Please re-enter.</small>').collapse('show');
        } else {
          let response;

          response = await this.cognito.confirmNewPassword(password01.val());

          response = await this.signIn();

          this.newPasswordModal.modal('hide');
        }
      } catch (e) {
        e.message = `#passwordForm.submit: ${e.message}`;
        console.error(e);
      }
    });

    /* reset password fields onHide */
    this.newPasswordModal.on('hide.bs.modal', () => {
      password01.val('');
      password02.val('');
      alertMessage.html('').collapse('hide');
    });
  }

  /**
   * @function signIn
   * @description on sign in button is clicked
   */
  async signIn() {
    try {
      await this.cognito.getCredentials();

      const {
        user: {
          username,
        },
      } = this.cognito;

      this.signinBtn.hide();

      this.signoutBtn.html(`<small>Welcome, ${username}</small>`).show();

      if (typeof this.onSignInHandler === 'function') {
        this.onSignInHandler(this);
      }
    } catch (e) {
      e.message = `SignInModal.signIn: ${e.message}`;
      console.error(e.message);
    }
  }

  /**
   * @function signOut
   * @description on sign out button is clicked
   */
  signOut() {
    this.signinBtn.show();

    this.signoutBtn.hide();

    if (typeof this.onSignOutHandler === 'function') {
      this.onSignOutHandler(this);
    }
  }

  /**
   * @function loadUser
   * @description load current coginto user
   * @param {CognitoUser} [cognito]
   */
  async loadUser(cognito = undefined) {
    try {
      if (cognito) {
        this.cognito = cognito;
      }

      await this.cognito.checkStatus();

      await this.signIn();
    } catch (e) {
      e.message = `SignInModal.loadUser: ${e.message}`;
      /* Don't really care other errors other than ConfigurationError */
      if (e instanceof ConfigurationError) {
        console.error(e.message);
      }
    }
  }

  /**
   * @function registerEvents
   * @description register sign in/out button events and sign in modal events
   */
  registerEvents() {
    /* sign out button is clicked */
    this.signoutBtn.click((event) => {
      try {
        event.preventDefault();

        const {
          user,
        } = this.cognito;

        console.log(`Bye ${user.username}`);

        this.cognito.signOut();

        this.signOut();
      } catch (e) {
        e.message = `${this.signoutBtn.attr('id')}.click: ${e.message}`;
        console.error(e.message);
      }
      return this;
    });

    /* modal dialog is about to show, reset the ui */
    this.signinModal.on('show.bs.modal', () => {
      try {
        this.alertMessage.html('').collapse('hide');
      } catch (e) {
        e.message = `${this.signinModal.attr('id')}.show.bs.modal: ${e.message}`;
        console.error(e.message);
      }
    });

    /* reset password field onHide */
    this.signinModal.on('hide.bs.modal', () => {
      this.inputPassword.val('');
      this.alertMessage.html('').collapse('hide');
    });

    /* sign in form submit event */
    this.signinForm.submit(async (event) => {
      try {
        event.preventDefault();

        if (!this.cognito) {
          throw new Error('invalid cognito setting');
        }

        const Username = this.inputUsername.val();
        const Password = this.inputPassword.val();
        const {
          status,
        } = await this.cognito.authenticate({ Username, Password });

        if (status === 'newPasswordRequired') {
          this.newPasswordModal.modal('show');
        } else {
          await this.signIn();
        }

        this.signinModal.modal('hide');
      } catch (e) {
        e.message = `${this.signinForm.attr('id')}.submit: ${e.message}`;
        this.alertMessage.html(`<small>${e.message}</small>`).collapse('show');
        console.error(e.message);
      }
    });
  }
}
