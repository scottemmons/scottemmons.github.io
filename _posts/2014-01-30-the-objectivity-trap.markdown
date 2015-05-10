---
author: Scott Emmons
comments: true
date: 2014-01-30 00:00:37+00:00
layout: post
slug: the-objectivity-trap
title: The Objectivity Trap
wordpress_id: 203
categories:
- Computer Science
---

Elijah Meeks, the Digital Humanities Specialist at Standard University, gave a great talk Monday at Indiana University concerning the use of networks in the humanities.

A key point he made is that if the underlying definition of relationships in a network is unsound, then entire network becomes meaningless. This is in agreement with Frye's criticism of networks in which he says that while almost anything can be represented by a network, few things ever should be.

I agree.

Though recent advances in the field of network science enable us to quantify everything, this quantification can be misleading. Take, for example, the idea of friendship.

If we wanted to quantitatively study a person's friendship using network science, all we'd need to do is download her email data. Then, we could construct a network containing the people with whom she corresponds as nodes connected by edges that represent email.

Next, we could weigh the network links based on the number of emails that were sent.

This quantification, weighted edges based on the number of emails, is easy. It allows us to construct a friendship metric in which we define the degree of friendship between two people by the number of emails they have sent to each other.

However, we must be careful when reading networks not to fall into what I call the objectivity trap.

In traditional science, quantity has always denoted objectivity. A gram is half of two grams. Period.

Modern science, and network science in particular, has entered a new age in which quantity is used to study inherently subjective relationships such as friendship. Because relationships can be quantified, it is often assumed that their significance is objective.

In the example of our friendship network, it would be natural to claim that a link with twice the weight represents twice the friendship. But this claim only holds true if the viewer agrees with the defined metric; namely, that the number of emails corresponds to strength of friendship.

Quantified relationships are not inherently objective.

Meaningless relationships create meaningless networks.

It is for this reason that the creators and viewers of networks must always be critical of the underlying metric definition.
