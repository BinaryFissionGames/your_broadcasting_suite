//This module manages cleaning up resources a process may hold, essentially.
//Under some circumstances, a process may exit without properly cleaning these resources up.
//This modules purpose is to clean up after other processes in case of those scenarios, as well as clean up
//after the current process when gracefully exiting.
