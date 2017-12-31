<template>
    <div class="config-window">
        <v-app>
            <div>
                <v-stepper v-model="e1">
                    <v-stepper-header>
                        <v-stepper-step step="1" :complete="e1 > 1">JIRA Setup</v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step step="2" :complete="e1 > 2">Choose a Project</v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step step="3">Setup Complete</v-stepper-step>
                    </v-stepper-header>

                    <v-stepper-items>
                        <v-stepper-content step="1">
                            <v-layout row wrap>
                                <v-flex xs4>
                                    <div class="info">
                                        Your JIRA credentials are stored in your OSX keychain.
                                    </div>
                                </v-flex>

                                <v-flex xs8>
                                    <div class="form">
                                        <v-form v-model="valid" ref="form" lazy-validation>
                                            <v-text-field
                                                    label="JIRA Board URL"
                                                    v-model="jiraUrl"
                                                    required
                                            ></v-text-field>
                                            <v-text-field
                                                    label="User Name"
                                                    v-model="jiraUserName"
                                                    required
                                            ></v-text-field>
                                            <v-text-field
                                                    label="Password"
                                                    v-model="jiraPassword"
                                                    required
                                            ></v-text-field>
                                        </v-form>

                                        <v-btn color="primary" @click.native="e1 = 2">Continue</v-btn>
                                        <v-btn flat>Cancel</v-btn>
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
                                        <v-form v-model="valid" ref="form" lazy-validation>
                                            <v-select
                                                    v-bind:items="[{text: 'Charge Manager'}, {text: 'Portal'}]"
                                                    v-model="project"
                                                    label="Select"
                                                    single-line
                                                    bottom
                                            ></v-select>
                                        </v-form>

                                        <v-btn color="primary" @click.native="e1 = 3">Continue</v-btn>
                                        <v-btn flat>Cancel</v-btn>
                                    </div>
                                </v-flex>
                            </v-layout>
                        </v-stepper-content>
                        <v-stepper-content step="3">
                            <v-layout row wrap>
                                <v-flex xs12>
                                    <div class="info">
                                        DONE!

                                        <v-btn color="primary" @click.native="e1 = 1">Continue</v-btn>
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

    export default {
        name: 'configWindow',
        data() {
            return {
                e1: 0,
                jiraUrl: '',
                jiraUserName: '',
                jiraPassword: '',
                project: null,
                valid: true,
            }
        },

        methods: {
            submit() {
                if (this.$refs.form.validate()) {
                    return false;
                }
            },
            clear() {
                this.$refs.form.reset()
            }
        },

        mounted() {
        }
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
    }

    .stepper {
        height: 400px;
    }

    .stepper__content {
        padding: 0;
    }
</style>


