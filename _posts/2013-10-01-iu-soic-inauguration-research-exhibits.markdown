---
author: Scott Emmons
comments: true
date: 2013-10-01 01:22:55+00:00
layout: post
slug: iu-soic-inauguration-research-exhibits
title: IU SoIC Inauguration Research Exhibits
wordpress_id: 160
categories:
- Computer Science
- Research
---

Last Friday was the inauguration of Indiana University's School of Informatics and Computing (SoIC). Through my internship at the Cyberinfrastructure for Network Science Center (CNS), I got the awesome opportunity to attend the ceremony. At the reception afterwards was a series of exhibits featuring current research being done by the school's faculty. While I didn't have the background necessary to fully understand all of the topics, I did find parts of one exhibit particularly interesting.

The exhibit was titled Mining vast semantic knowledge networks for next generation drug discovery, by Abhik Seal, Jae Hong Shin, Dazhi Jiao, Jeremy J Yang, and David J Wild. Overall, the project focused on mining large amounts of chemistry and biology data to improve pharmaceutical drugs. There were two aspects of the project that stood out to me.

The first aspect wass the RDF data format that the researchers used. I hadn't heard of RDF before, but after learning more RDF looks like a powerful way to store and use semantic data. In RDF, all information is stored in subject predicate object format, called a triple. These triples are like a sentence; the subject is the item being discussed, and the predicate defines a relationship between the subject and the object. For example, the sentence the sky has the color blue would become sky color blue. The subject, sky, is related to the object, blue, through the predicate, the attribute color.

I find the idea of knowledge stored in a triple powerful because it enables abstract concepts to be stored as semantic data. I wouldn't normally think of a fact such as the sky is blue as a piece of data, but it is. The CNS focuses on data visualization, and I'm sure that awesome semantic maps could be created from RDF data.

The second aspect of the project that interested me was the ability of the researches to link multiple datasets. In order to study data across various domains, researchers took the original data”which spanned topics such as genes, proteins, genetic variations, chemical compounds, diseases, and drugs”and converted it all to RDF. Then, they created a querying tool (based on a language called SPARQL) that could run across multiple datasets. Using the tool on these data sets, they were able to create a semantic web of chemistry and biological data.

The idea of linked data appeals to me because it allows for data use across multiple domains. It is possible that CNS, which focuses on map making, could use a similar approach to create a map of relationships over multiple domains.

As my advisor Katy Borner told me, one of the best parts about being at a research university is the opportunity to interact with some of the leading researchers in a field. I enjoyed viewing the exhibits at the SoIC inauguration, and I'm looking forward to the next research exhibit I can attend.
