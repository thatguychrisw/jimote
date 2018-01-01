<template>
    <div class="config-window">
        <v-app>
            <div>
                <v-stepper v-model="screenIdxSelected">
                    <v-stepper-header>
                        <v-stepper-step step="1" :complete="screenIdxSelected > 1">JIRA Setup</v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step step="2" :complete="screenIdxSelected > 2">Choose a Project</v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step step="3">Setup Complete</v-stepper-step>
                    </v-stepper-header>

                    <v-stepper-items>
                        <v-stepper-content step="1">
                            <v-layout row wrap>
                                <v-flex xs4>
                                    <div class="info">
                                        <p>Welcome!</p>
                                        <p>In order to get started using Jimote please provide your JIRA credentials
                                            so we can access your projects.</p>
                                        <p>Your credentials are stored in the osx keychain.</p>
                                    </div>
                                </v-flex>

                                <v-flex xs8>
                                    <div class="form">
                                        <v-form v-model="valid" ref="form" lazy-validation>
                                            <v-text-field
                                                    label="JIRA Board URL"
                                                    v-model="screen.jira.url.value"
                                                    :rules="screen.jira.url.rules"
                                                    required
                                            ></v-text-field>
                                            <v-text-field
                                                    label="User Name"
                                                    v-model="screen.jira.userName.value"
                                                    :rules="screen.jira.userName.rules"
                                                    required
                                            ></v-text-field>
                                            <v-text-field
                                                    label="Password"
                                                    v-model="screen.jira.password.value"
                                                    :rules="screen.jira.password.rules"
                                                    required
                                            ></v-text-field>

                                            <div class="actions">
                                                <v-btn color="primary" @click.native="submit()">Continue</v-btn>
                                            </div>
                                        </v-form>
                                    </div>
                                </v-flex>
                            </v-layout>

                        </v-stepper-content>
                        <v-stepper-content step="2">
                            <v-layout row wrap>
                                <v-flex xs4>
                                    <div class="info">
                                        Choose a project
                                    </div>
                                </v-flex>

                                <v-flex xs8>
                                    <div class="form">
                                        <v-form v-model="valid" ref="projectForm" lazy-validation>
                                            <v-select
                                                    :items="screen.project.jira.projects"
                                                    v-model="screen.project.name"
                                                    item-text="name"
                                                    item-value="key"
                                                    label="Select"
                                                    single-line
                                                    bottom
                                            ></v-select>

                                            <div class="actions">
                                                <v-btn color="primary" @click.native="screenIdxSelected = 3">Continue
                                                </v-btn>
                                                <v-btn flat @click.native="screenIdxSelected = 1">Back</v-btn>
                                            </div>
                                        </v-form>

                                    </div>
                                </v-flex>
                            </v-layout>
                        </v-stepper-content>
                        <v-stepper-content step="3">
                            <v-layout row wrap>
                                <v-flex xs12>
                                    <div class="info">
                                        READY TO USE
                                    </div>
                                </v-flex>
                            </v-layout>
                        </v-stepper-content>
                    </v-stepper-items>
                </v-stepper>
            </div>
        </v-app>
    </div>
</template>

<script>
    import ElectronStore from 'electron-store';
    import JiraApi from 'jira-client';

    const store = new ElectronStore();

    export default {
        name: 'configWindow',
        data() {
            return {
                screenIdxSelected: 0,

                screen: {
                    jira: {
                        url: {
                            value: null,
                            rules: [
                                (v) => !!v || 'JIRA project url is required',
                            ],
                        },
                        userName: {
                            value: null,
                            rules: [
                                (v) => !!v || 'user name is required',
                            ],
                        },
                        password: {
                            value: null,
                            rules: [
                                (v) => !!v || 'password is required',
                            ],
                        },
                    },

                    project: {
                        jira: {
                            projects: []
                        },

                        name: null,
                    }
                },
            }
        },

        methods: {
            submit() {
                if (this.$refs.form.validate()) {
                    store.set('jira.url', this.screen.jira.url.value);
                    store.set('jira.userName', this.screen.jira.userName.value);
                    store.set('jira.password', this.screen.jira.password.value);

                    const jira = new JiraApi({
                        host: this.screen.jira.url.value,
                        username: this.screen.jira.userName.value,
                        password: this.screen.jira.password.value,
                    });

                    jira.listProjects().then((projects) => {
                        this.screen.project.jira.projects = projects.map(project => ({
                            key: project.key,
                            name: project.name
                        }));

                        this.screenIdxSelected = 2;
                    });
                }
            },
        },

    }
</script>

<style lang="scss" scoped>
    .config-window {
        color: black;
    }

    .info {
        height: 400px;
        padding: 15%;
        color: white;
    }

    .form {
        width: 80%;
        margin: 0 auto;
        padding: 5%;

        .actions {
            position: absolute;
            bottom: 90px;
        }
    }

    .stepper {
        height: 400px;
    }

    .stepper__content {
        padding: 0;
    }
</style>


