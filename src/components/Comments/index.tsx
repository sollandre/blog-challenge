import { useEffect, useState } from 'react';

const useUtterances = (commentNodeId) => {
	useEffect(() => {
    const scriptParentNode = document.getElementById(commentNodeId);
		if (!scriptParentNode) return;
		
		const script = document.createElement('script');
		script.src = 'https://utteranc.es/client.js';
		script.async = true;
		script.setAttribute('repo', 'sollandre/blog-challenge');
		script.setAttribute('issue-term', 'pathname');
		script.setAttribute('label', 'comment :speech_balloon:');
		script.setAttribute('theme', 'photon-dark');
		script.setAttribute('crossorigin', 'anonymous');

		
		scriptParentNode.replaceChildren(script);

		return () => {
      scriptParentNode
    };
	}, [commentNodeId]);
};

export const Comments = (commentNodeId) => {
  useUtterances(commentNodeId);
  return <div id={commentNodeId} />;
}