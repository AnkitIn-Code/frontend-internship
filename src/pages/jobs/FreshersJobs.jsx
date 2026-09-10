import React from 'react';
import AllJobs from './AllJobs';

/**
 * Freshers Jobs — pre-filtered to job_type=Fresher
 */
const FreshersJobs = () => (
  <AllJobs
    defaultJobType="Fresher"
    pageTitle="Fresher Jobs"
    pageSubtitle="Entry-level job opportunities across India for fresh graduates. Start your career today."
  />
);

export default FreshersJobs;
