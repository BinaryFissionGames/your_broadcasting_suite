#Steps to setup for dev...

1. Install and setup mysql on the host machine
    - Make sure to create a user, as well as a database for the project (default named your_broadcasting_suite)
2. Install Helm (https://helm.sh/)
3. Install and setup kubernetes on the host machine (I use Docker Desktop's kubernetes for this)
    - See https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/ for details on installing/starting the WebUI
    - See the `admin-service-acct.yaml` for applying an admin service acct for connecting to the dashboard, as well as
      get-admin-user-token.ps1 to get the users token for auth
    - Install ingress-nginx (https://kubernetes.github.io/ingress-nginx/deploy/#using-helm)
4. Install the CRDs for cert-manager (https://cert-manager.io/docs/installation/kubernetes/#steps, option 1)
5. Create a values.dev.yaml with overrides for values.yaml (in particular, the devCaCerts, hostnames, as well as the mysql host)
6. Create the dev dockerfiles for deployment (run make_dev_dockerfiles.bat in the scripts folder).
7. Run the job for database migrations to properly set up all the database tables (`kubectl apply -f scripts/kubernetes_configs/run_db_migrations_job.yaml`)
8. Install the helm chart (CD into charts/dev-chart, run `helm install -f values.dev.yaml your-broadcasting-suite .`)
9. Install [ksync](https://github.com/ksync/ksync/releases)
10. Run `ksync init` 
11. Run `ksync watch` (starts the ksync client, may be run in the background)
    * Note - Syncthing UI becomes available on http://127.0.0.1:8384/, may need to check this if you see problems.
    * .stfolder is added as a marker for syncthing, deleting this causes problems
    * to later clear all configurations, you can use the command `ksync delete --all`. This may need to be run more than once.
12. Run the `ksync-create-spec.ps1` script under the scripts directory in order to create the synchronization specs.

## Extra notes

- Re-run the dockerfile creation script if any changes are made to non-source files (e.g. configs, or new packages are installed),
and roll the pod to take the changes.
