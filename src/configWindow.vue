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
                                                    label="JIRA Host"
                                                    v-model="screen.jira.host.value"
                                                    :rules="screen.jira.host.rules"
                                                    placeholder="host.atlassian.net"
                                                    required
                                            ></v-text-field>
                                            <v-text-field
                                                    label="User Name"
                                                    v-model="screen.jira.username.value"
                                                    :rules="screen.jira.username.rules"
                                                    placeholder="user@domain.com"
                                                    required
                                            ></v-text-field>
                                            <v-text-field
                                                    label="Password"
                                                    v-model="screen.jira.password.value"
                                                    :rules="screen.jira.password.rules"
                                                    type="password"
                                                    required
                                            ></v-text-field>

                                            <div class="actions">
                                                <v-btn color="primary"
                                                       :loading="screen.jira.isLoading"
                                                       :disabled="screen.jira.isLoading"
                                                       @click.native="processJiraStep()">Continue
                                                </v-btn>
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
                                                    autocomplete
                                                    bottom
                                            ></v-select>

                                            <div class="actions">
                                                <v-btn color="primary" @click.native="processProjectStep()">
                                                    Continue
                                                </v-btn>

                                                <v-btn v-if="jiraClient !== null" flat @click.native="setStep('jira')">
                                                    Back
                                                </v-btn>
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
                                        <h1>Configuration Complete!</h1>

                                        <h3>Use CMD+J to start using Jimote!</h3>
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
                jiraClient: null,

                screen: {
                    jira: {
                        host: {
                            value: null,
                            rules: [
                                (v) => !!v || 'JIRA host is required',
                            ],
                        },
                        username: {
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

                        isLoading: false,
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

        created: function () {
            console.log('Checking to see if jira credentials have been provided.');

            const jiraConfig = store.get('jira');
            console.log('Jira configuration:', jiraConfig);

            // Jira credentials stored, user may have quit the app and not selected a project
            if (jiraConfig !== undefined) {
                console.log('Found credentials, logging user in.');

                this.jiraClient = new JiraApi(jiraConfig);

                for (let configuration in jiraConfig) {
                    if (this.screen.jira.hasOwnProperty(configuration)) {
                        this.screen.jira[configuration].value = jiraConfig[configuration];
                    }
                }

                // If they left off at the project screen start there
                if (jiraConfig['project'] !== undefined) {
                    this.loadProjects().then(() => {
                        this.screenIdxSelected = 2;

                        this.setStep('project');
                    });
                } else {
                    // Finished, should really only be here in known situations like testing
                    this.setStep('configured');
                }
            }
        },

        methods: {
            processJiraStep() {
                if (this.$refs.form.validate()) {
                    this.screen.jira.isLoading = true;

                    let
                        host = this.screen.jira.host.value,
                        username = this.screen.jira.username.value,
                        password = this.screen.jira.password.value;

                    store.set('jira.host', host);
                    store.set('jira.username', username);
                    store.set('jira.password', password);

                    console.log('Connecting to Jira using the following configuration', store.get('jira'));

                    this.jiraClient = new JiraApi({host, username, password});

                    this.loadProjects().then(() => {
                        this.screen.jira.isLoading = false;

                        this.setStep('project');
                    });
                }
            },

            processProjectStep() {
                store.set('project', this.screen.project.name);

                console.log('Project configured:', store.get('project'));

                this.setStep('configured');
            },

            loadProjects() {
                return new Promise((resolve, reject) => {
                    console.log('Fetching projects.');

                    this.jiraClient.listProjects().then((projects) => {
                        console.log('Received projects:', projects);

                        this.screen.project.jira.projects = projects.map(project => ({
                            key: project.key,
                            name: project.name
                        }));

                        resolve();
                    }).catch(error => {
                        reject(error);
                    });
                });
            },

            setStep(step) {
                console.log('Set step to:', step);

                switch (step) {
                    case 'jira':
                        this.screenIdxSelected = 1;

                        break;
                    case 'project':
                        this.screenIdxSelected = 2;

                        break;
                    case 'configured':
                        this.screenIdxSelected = 3;

                        store.set('jira.configured', true);

                        break;
                    default:
                        console.error('Unknown step:', step);

                        break;
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
        padding: 10%;
        color: white;

        h1 {
            margin-bottom: .5em;
        }
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


