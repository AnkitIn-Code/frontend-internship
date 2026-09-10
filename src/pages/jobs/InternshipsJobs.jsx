import React from 'react';
import AllJobs from './AllJobs';

/**
 * Internships Jobs — pre-filtered to job_type=Internship
 */
const InternshipsJobs = () => (
  <AllJobs
    defaultJobType="Internship"
    pageTitle="Internships"
    pageSubtitle="Discover internship opportunities across top companies in India. Gain real-world experience."
  />
);

export default InternshipsJobs;
